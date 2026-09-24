import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Packages, ReleaseTracks, ReleaseVersions, Versions } from './collections';
import { PublishOptionsSchema, validate } from './schemas';
import { checkAccess } from './utils';

/** Publishes `{count}` of the cursor as document `name` of the client-side `counts` collection. */
async function publishCount(sub, name, cursor) {
  let count = 0;
  let initializing = true;
  const handle = await cursor.observeChangesAsync({
    added: () => {
      count++;
      if (!initializing) sub.changed('counts', name, { count });
    },
    removed: () => {
      count--;
      sub.changed('counts', name, { count });
    },
  });
  initializing = false;
  sub.added('counts', name, { count });
  sub.onStop(() => handle.stop());
}

/** Publications fail closed: any error (access, validation) publishes nothing. */
function publish(name, handler) {
  Meteor.publish(name, async function (...args) {
    try {
      return await handler.apply(this, args);
    } catch {
      return [];
    }
  });
}

const versionListFields = { packageName: 1, lastUpdated: 1, versionMagnitude: 1, version: 1 };
const releaseVersionListFields = { track: 1, versionMagnitude: 1, version: 1, lastUpdated: 1, publishedBy: 1, recommended: 1 };

publish('/stratosphere/loggedInUser', function () {
  if (!this.userId) return [];
  return Meteor.users.find(this.userId, { fields: { type: 1, permissions: 1 } });
});

publish('/stratosphere/nbPackages', async function () {
  await checkAccess('canSynchronize', this.userId);
  await publishCount(this, 'nbPackages', Packages.find({ private: true }, { fields: { _id: 1 } }));
  this.ready();
});

publish('/stratosphere/packages', async function (options) {
  await checkAccess('canSynchronize', this.userId);
  validate(PublishOptionsSchema, options);
  await publishCount(this, 'nbPackages', Packages.find({ private: true }, { fields: { _id: 1 } }));
  return Packages.find({ private: true }, options);
});

publish('/stratosphere/package', async function (packageName) {
  await checkAccess('canSynchronize', this.userId);
  check(packageName, String);
  await publishCount(this, 'nbVersions', Versions.find({ packageName }, { fields: { _id: 1 } }));
  return [
    Packages.find({ name: packageName }),
    Versions.find({ packageName }, { sort: { versionMagnitude: -1 }, limit: 5, fields: versionListFields }),
  ];
});

publish('/stratosphere/versions', async function (packageName) {
  await checkAccess('canSynchronize', this.userId);
  check(packageName, String);
  return Versions.find({ packageName }, { fields: versionListFields });
});

publish('/stratosphere/version', async function (versionId) {
  await checkAccess('canSynchronize', this.userId);
  check(versionId, String);
  return Versions.find(versionId);
});

publish('/stratosphere/releaseTracks', async function (options) {
  await checkAccess('canSynchronize', this.userId);
  validate(PublishOptionsSchema, options);
  await publishCount(this, 'nbTracks', ReleaseTracks.find({ private: true }, { fields: { _id: 1 } }));
  return ReleaseTracks.find({ private: true }, options);
});

publish('/stratosphere/releaseTrack', async function (track) {
  await checkAccess('canSynchronize', this.userId);
  check(track, String);
  await publishCount(this, 'nbReleaseVersions', ReleaseVersions.find({ track }, { fields: { _id: 1 } }));
  return [
    ReleaseTracks.find({ name: track }),
    ReleaseVersions.find({ track }, { sort: { versionMagnitude: -1 }, limit: 5, fields: releaseVersionListFields }),
  ];
});

publish('/stratosphere/releaseVersions', async function (track) {
  await checkAccess('canSynchronize', this.userId);
  check(track, String);
  return ReleaseVersions.find({ track }, { fields: releaseVersionListFields });
});

publish('/stratosphere/releaseVersion', async function (versionId) {
  await checkAccess('canSynchronize', this.userId);
  check(versionId, String);
  return ReleaseVersions.find(versionId);
});

publish('/stratosphere/users', async function () {
  await checkAccess('superUser', this.userId);
  return Meteor.users.find({}, { fields: { username: 1, type: 1, permissions: 1 } });
});
