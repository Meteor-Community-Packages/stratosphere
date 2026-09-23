import fs from 'node:fs/promises';
import path from 'node:path';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Builds, Metadata, Packages, ReleaseTracks, ReleaseVersions, UploadTokens, Versions } from '../collections';
import { checkAccess } from '../utils';
import { createUserStub } from '../accounts';

/** Tells downstream meteor-tools to reset their catalog on their next sync. */
const markDeletion = date => Metadata.updateAsync({ key: 'lastDeletion' }, { $set: { value: date.getTime() } });

const removeUploads = (...segments) =>
  fs.rm(path.join(Meteor.settings.directories.uploads, ...segments), { recursive: true, force: true });

/**
 * Re-caches the newest remaining child as `latestVersion` on the parent, or unsets it.
 */
async function resetLatestVersion(collection, parent, childCollection, childSelector, date, withReadme) {
  const latest = await childCollection.findOneAsync(childSelector, {
    sort: { versionMagnitude: -1 },
    fields: { description: 1, version: 1, 'readme.url': 1 },
  });
  if (!latest) {
    return collection.updateAsync(parent._id, { $unset: { latestVersion: 1 } });
  }
  return collection.updateAsync(parent._id, {
    $set: {
      latestVersion: {
        id: latest._id,
        description: latest.description,
        version: latest.version,
        ...(withReadme && { readme: latest.readme?.url }),
        published: date,
      },
    },
  });
}

const notSuperUser = { 'permissions.superUser': { $ne: true } };

Meteor.methods({
  async '/stratosphere/unPublishPackage'(id) {
    await checkAccess('canUnpublish', this.userId);
    check(id, String);

    // We can only delete private packages
    const pack = await Packages.findOneAsync({ _id: id, private: true });
    if (!pack) throw new Meteor.Error('No such private package, stratosphere can only unpublish private packages');

    await Packages.removeAsync(pack._id);
    await Versions.removeAsync({ packageName: pack.name });
    await Builds.removeAsync({ buildPackageName: pack.name });
    await UploadTokens.removeAsync({ packageId: pack._id });

    // Restore upstream package
    if (pack.upstream) {
      await Packages.updateAsync({ _id: pack.upstream }, { $set: { name: pack.name } });
      await Versions.updateAsync({ packageName: `${pack.name}-UPSTREAM` }, { $set: { packageName: pack.name } }, { multi: true });
    }

    await markDeletion(new Date());
    await removeUploads(pack._id);

    const msg = `Unpublished package ${pack.name}`;
    console.log(msg);
    return msg;
  },

  async '/stratosphere/unPublishVersion'(id) {
    await checkAccess('canUnpublish', this.userId);
    check(id, String);

    // We can only delete private versions
    const version = await Versions.findOneAsync({ _id: id, private: true }, { fields: { version: 1, packageName: 1 } });
    if (!version) throw new Meteor.Error('No such private version, Stratosphere can only unpublish private versions');

    await Versions.removeAsync(version._id);
    await Builds.removeAsync({ versionId: version._id });
    await UploadTokens.removeAsync({ versionId: version._id });

    const date = new Date();
    const pack = await Packages.findOneAsync({ name: version.packageName }, { fields: { name: 1, latestVersion: 1 } });
    if (pack.latestVersion?.id === version._id) {
      await resetLatestVersion(Packages, pack, Versions, { packageName: version.packageName }, date, true);
    }

    await markDeletion(date);
    await removeUploads(pack._id, 'versions', version._id);

    const msg = `Unpublished version ${version.version} of package ${pack.name}`;
    console.log(msg);
    return msg;
  },

  async '/stratosphere/unPublishReleaseTrack'(id) {
    await checkAccess('canUnpublish', this.userId);
    check(id, String);

    // We can only delete private tracks
    const track = await ReleaseTracks.findOneAsync({ _id: id, private: true }, { fields: { name: 1 } });
    if (!track) throw new Meteor.Error('No such private release track, Stratosphere can only unpublish private release tracks');

    await ReleaseTracks.removeAsync(track._id);
    await ReleaseVersions.removeAsync({ track: track.name });
    await markDeletion(new Date());

    const msg = `Unpublished release track ${track.name}`;
    console.log(msg);
    return msg;
  },

  async '/stratosphere/unPublishReleaseVersion'(id) {
    await checkAccess('canUnpublish', this.userId);
    check(id, String);

    // We can only delete private versions
    const releaseVersion = await ReleaseVersions.findOneAsync({ _id: id, private: true }, { fields: { track: 1, version: 1 } });
    if (!releaseVersion) throw new Meteor.Error('No such private release version, Stratosphere can only unpublish private releaseVersions');

    await ReleaseVersions.removeAsync(releaseVersion._id);

    const date = new Date();
    const track = await ReleaseTracks.findOneAsync({ name: releaseVersion.track }, { fields: { latestVersion: 1 } });
    if (track?.latestVersion?.id === releaseVersion._id) {
      await resetLatestVersion(ReleaseTracks, track, ReleaseVersions, { track: releaseVersion.track }, date, false);
    }

    await markDeletion(date);

    const msg = `Unpublished release version ${releaseVersion.version} of track ${releaseVersion.track}`;
    console.log(msg);
    return msg;
  },

  async '/stratosphere/addUser'(username) {
    await checkAccess('superUser', this.userId);
    check(username, String);
    await createUserStub(username, { canSynchronize: true, canPublish: true });
  },

  async '/stratosphere/removeUser'(id) {
    await checkAccess('superUser', this.userId);
    check(id, String);
    return Meteor.users.removeAsync({ _id: id, ...notSuperUser });
  },

  async '/stratosphere/setUserPermission'(id, permission, value) {
    await checkAccess('superUser', this.userId);
    check(id, String);
    check(permission, Match.OneOf('canPublish', 'canUnpublish'));
    check(value, Boolean);
    return Meteor.users.updateAsync({ _id: id, ...notSuperUser }, { $set: { [`permissions.${permission}`]: value } });
  },
});
