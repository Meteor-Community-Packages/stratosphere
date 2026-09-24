import { Meteor } from 'meteor/meteor';

export async function checkAccess(permission, userId) {
  if (!(await hasAccess(permission, userId))) {
    throw new Meteor.Error('403', 'Forbidden');
  }
}

export async function hasAccess(permission = 'superUser', userId) {
  // XXX: hack until meteor-tool allows login before sync
  if (permission === 'canSynchronize') return true;
  if (!Meteor.settings.public.loginRequired) return true;
  if (!userId) return false;

  const user = await Meteor.users.findOneAsync(userId, { fields: { permissions: 1 } });
  return !!(user?.permissions?.superUser || user?.permissions?.[permission]);
}

/** `{username, id}` of the given user, or `{}` when nobody is logged in. */
export async function userRef(userId) {
  const user = userId && (await Meteor.users.findOneAsync(userId, { fields: { username: 1 } }));
  return user ? { username: user.username, id: user._id } : {};
}

/** Mongo can't store dotted keys (package names), so dependency maps are stored as arrays. */
export const toArrayFromObj = (object, keyName) =>
  Object.entries(object ?? {}).map(([key, value]) => ({ ...value, [keyName]: key }));

export const toObjFromArray = (array, keyName) =>
  Object.fromEntries((array ?? []).map(item => [item[keyName], item]));

export const uploadUrl = path => `${Meteor.settings.public.url}/upload/${path}`;
