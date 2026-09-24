import { For, Show } from 'solid-js';
import { Meteor } from 'meteor/meteor';
import { callMethod, createTracker, isSuperUser, loginRequired } from './lib';

const permissions = ['canPublish', 'canUnpublish'];

export const Users = () => {
  const users = createTracker(() => {
    Meteor.subscribe('/stratosphere/users');
    const all = Meteor.users.find({}, { sort: { username: 1 } }).fetch();
    return {
      superUsers: all.filter(user => user.permissions?.superUser),
      users: all.filter(user => !user.permissions?.superUser),
    };
  });

  async function addUser(event) {
    event.preventDefault();
    const input = event.currentTarget.elements.username;
    await callMethod(`Added ${input.value}`, 'Error while adding user', '/stratosphere/addUser', input.value.trim());
    input.value = '';
  }

  const setPermission = (user, permission, value) =>
    callMethod(null, 'Error while changing permission', '/stratosphere/setUserPermission', user._id, permission, value);

  const removeUser = user =>
    confirm(`Remove ${user.username}?`) &&
    callMethod(`Removed ${user.username}`, 'Error while removing user', '/stratosphere/removeUser', user._id);

  return (
    <Show
      when={loginRequired()}
      fallback={<p class="card">User management can only be used if you set loginRequired to true in the settings file.</p>}
    >
      <Show when={isSuperUser()} fallback={<p class="card">Only super users can manage users.</p>}>
        <section class="card">
          <h2>Super users</h2>
          <p>These users are defined in the settings file.</p>
          <ul class="chips">
            <For each={users().superUsers}>{user => <li>{user.username}</li>}</For>
          </ul>
        </section>
        <section class="card">
          <h2>Users</h2>
          <form class="inline" onSubmit={addUser}>
            <input name="username" required placeholder="meteor developer username" aria-label="Username to add" />
            <button class="primary">Add user</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <For each={permissions}>{permission => <th>{permission}</th>}</For>
                <th />
              </tr>
            </thead>
            <tbody>
              <For each={users().users}>
                {user => (
                  <tr>
                    <td>
                      {user.username}
                      <Show when={user.type === 'stub'}>
                        <small> (never logged in)</small>
                      </Show>
                    </td>
                    <For each={permissions}>
                      {permission => (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`${permission} for ${user.username}`}
                            checked={!!user.permissions?.[permission]}
                            onChange={e => setPermission(user, permission, e.currentTarget.checked)}
                          />
                        </td>
                      )}
                    </For>
                    <td>
                      <button class="warn" onClick={() => removeUser(user)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </section>
      </Show>
    </Show>
  );
};
