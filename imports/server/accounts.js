import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';

Accounts.config({ forbidClientAccountCreation: true });

/**
 * Stub users are placeholders for meteor-developer accounts that are allowed to log in.
 * On first login the real account takes over the stub's permissions.
 */
export function createUserStub(username, permissions = { canSynchronize: true }) {
  return Accounts.insertUserDoc({}, { username, permissions, type: 'stub' });
}

Accounts.onCreateUser(async (options, user) => {
  const username = user.services?.['meteor-developer']?.username;
  if (username) user.username = username;

  if (Meteor.settings.public.loginRequired) {
    const stub = await Meteor.users.findOneAsync({ username: user.username, type: 'stub' }, { fields: { permissions: 1 } });
    if (user.type !== 'stub') {
      if (!stub) throw new Meteor.Error('User not allowed');
      user.permissions = stub.permissions;
      await Meteor.users.removeAsync(stub._id);
    } else if (stub) {
      throw new Meteor.Error('Duplicate user');
    }
  } else if (user.type === 'stub') {
    throw new Meteor.Error('You can not create stubs when loginRequired is set to false');
  }

  user.permissions ??= { canSynchronize: true };
  return user;
});

/** Configures the meteor-developer login and syncs super users from settings. */
export async function setupAccounts() {
  const { meteorDeveloperAccount, superUsers = [] } = Meteor.settings;
  if (meteorDeveloperAccount) {
    await ServiceConfiguration.configurations.upsertAsync(
      { service: 'meteor-developer' },
      { $set: { clientId: meteorDeveloperAccount.clientId, secret: meteorDeveloperAccount.secret } },
    );
  }

  if (!Meteor.settings.public.loginRequired) {
    await Meteor.users.removeAsync({ type: 'stub' });
    return;
  }

  if (!superUsers.length) {
    throw new Error('If login is required you need to set at least one super user in the settings.json file');
  }

  await Meteor.users.updateAsync(
    { 'permissions.superUser': true, username: { $nin: superUsers } },
    { $unset: { 'permissions.superUser': true } },
    { multi: true },
  );
  await Meteor.users.updateAsync({ username: { $in: superUsers } }, { $set: { 'permissions.superUser': true } }, { multi: true });

  for (const username of superUsers) {
    if (!(await Meteor.users.findOneAsync({ username }, { fields: { _id: 1 } }))) {
      await createUserStub(username, { superUser: true });
    }
  }
}
