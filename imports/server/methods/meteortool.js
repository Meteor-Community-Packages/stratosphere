// Methods called by meteor-tool (`meteor publish`, `meteor admin ...`), mirroring Troposphere's API.
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Builds, Packages, ReleaseTracks, ReleaseVersions, UploadTokens, Versions } from '../collections';
import {
  ChangePackageHomepageSchema,
  ChangeVersionMetadataSchema,
  ChangeVersionMigrationStatusSchema,
  CreatePackageBuildSchema,
  CreatePackageSchema,
  CreatePackageVersionSchema,
  CreateReleaseTrackSchema,
  CreateReleaseVersionSchema,
  ModifyMaintainerSchema,
  PackageVersionHashesSchema,
  RecommendVersionSchema,
  validate,
  VersionIdentifierSchema,
} from '../schemas';
import { checkAccess, toArrayFromObj, uploadUrl, userRef } from '../utils';
import { versionMagnitude } from '/imports/api/versionMagnitude';

const targets = {
  package: { collection: Packages, childCollection: Versions, childReference: 'packageName', schema: CreatePackageSchema },
  track: { collection: ReleaseTracks, childCollection: ReleaseVersions, childReference: 'track', schema: CreateReleaseTrackSchema },
};

/**
 * Creates a private package/track. If a public (upstream) one with the same name exists,
 * it is renamed with an "-UPSTREAM" suffix.
 */
async function makePrivate(target, data, userId) {
  const { collection, childCollection, childReference, schema } = targets[target];
  validate(schema, data);

  const record = await collection.findOneAsync({ name: data.name });
  if (record?.private) throw new Meteor.Error(`Private ${target} already exists.`);

  const date = new Date();
  const insert = { name: data.name, hidden: true, private: true, lastUpdated: date, maintainers: [] };

  if (record) {
    console.log(`Renaming existing public ${target}`);
    insert.upstream = record._id;
    await collection.updateAsync(record._id, { $set: { name: `${record.name}-UPSTREAM`, lastUpdated: date } });
    await childCollection.updateAsync(
      { [childReference]: record.name },
      { $set: { [childReference]: `${record.name}-UPSTREAM`, lastUpdated: date } },
      { multi: true },
    );
  }

  const maintainer = await userRef(userId);
  if (maintainer.id) insert.maintainers.push(maintainer);

  return collection.insertAsync(insert);
}

async function modifyMaintainer(target, name, username, modifier) {
  validate(ModifyMaintainerSchema, { name, username });
  console.log(`${modifier.$push ? 'Adding' : 'Removing'} user ${username} ${modifier.$push ? 'to' : 'from'} ${target} maintainers`);
  if (!(await targets[target].collection.updateAsync({ name, private: true }, modifier))) {
    throw new Meteor.Error('404', `Private ${target} not found!`);
  }
}

async function setRecommendationStatus(track, version, recommended) {
  validate(RecommendVersionSchema, { track, version, recommended });
  console.log('Changing release version recommendation state');
  const updated = await ReleaseVersions.updateAsync(
    { track, version, private: true },
    { $set: { recommended, lastUpdated: new Date() } },
  );
  if (!updated) throw new Meteor.Error('404', 'Private release version not found');
}

async function createReleaseVersion(record, userId) {
  validate(CreateReleaseVersionSchema, record);

  const track = await ReleaseTracks.findOneAsync({ name: record.track, private: true });
  if (!track) throw new Meteor.Error('No such private track');

  const date = new Date();
  Object.assign(record, {
    lastUpdated: date,
    versionMagnitude: versionMagnitude(record.version),
    private: true,
    published: date,
    publishedBy: await userRef(userId),
  });
  record._id = await ReleaseVersions.insertAsync(record);

  // Cache latest version
  if (!track.latestVersion || versionMagnitude(track.latestVersion.version) < record.versionMagnitude) {
    await ReleaseTracks.updateAsync(track._id, {
      $set: { latestVersion: { id: record._id, description: record.description, version: record.version, published: date } },
    });
  }
}

/** Finds a used (i.e. uploaded) upload token of the given type and consumes it. */
async function consumeUploadToken(uploadToken, type) {
  const tokenData = await UploadTokens.findOneAsync({ _id: uploadToken, used: true });
  if (tokenData?.type !== type) throw new Meteor.Error('Invalid upload token');
  await UploadTokens.removeAsync({ _id: { $in: [tokenData._id, ...(tokenData.relatedTokens ?? [])] } });
  return tokenData;
}

const createUploadToken = async token => UploadTokens.insertAsync({ createdAt: new Date(), used: false, ...token });

Meteor.methods({
  async createPackage(data) {
    await checkAccess('canPublish', this.userId);
    return makePrivate('package', data, this.userId);
  },

  async createPackageVersion(record) {
    await checkAccess('canPublish', this.userId);
    if (record && typeof record === 'object') {
      record.dependencies = toArrayFromObj(record.dependencies, 'packageName');
    }
    validate(CreatePackageVersionSchema, record, { autoConvert: false, removeEmptyStrings: false });

    const pack = await Packages.findOneAsync({ name: record.packageName });
    if (!pack) throw new Meteor.Error('404', 'Package does not exist');

    if (!pack.private) {
      console.log(`Making package ${pack.name} private`);
      pack._id = await makePrivate('package', { name: pack.name }, this.userId);
    } else if (await Versions.findOneAsync({ packageName: record.packageName, version: record.version })) {
      throw new Meteor.Error('Version already exists');
    }

    Object.assign(record, {
      versionMagnitude: versionMagnitude(record.version),
      lastUpdated: new Date(),
      private: true,
      hidden: true,
    });
    record._id = await Versions.insertAsync(record);

    const readmeToken = await createUploadToken({ type: 'readme', versionId: record._id, packageId: pack._id });
    const versionToken = await createUploadToken({
      type: 'version',
      versionId: record._id,
      packageId: pack._id,
      relatedTokens: [readmeToken],
    });

    console.log(`Created package version ${record._id}`);
    return {
      uploadToken: versionToken,
      uploadUrl: uploadUrl(`?token=${versionToken}`),
      readmeUrl: uploadUrl(`?token=${readmeToken}`),
    };
  },

  async publishPackageVersion(uploadToken, hashes) {
    await checkAccess('canPublish', this.userId);
    check(uploadToken, String);
    validate(PackageVersionHashesSchema, hashes);

    const tokenData = await consumeUploadToken(uploadToken, 'version');
    const version = await Versions.findOneAsync({ _id: tokenData.versionId });
    if (!version) throw new Meteor.Error('Invalid upload token');

    // XXX verify hashes?
    const publishedBy = await userRef(this.userId);
    if (publishedBy.id) {
      await Packages.updateAsync(
        { name: version.packageName, 'maintainers.username': { $ne: publishedBy.username } },
        { $push: { maintainers: publishedBy } },
      );
    }

    const date = new Date();
    const versionPath = `${tokenData.packageId}/versions/${tokenData.versionId}`;
    const modifier = {
      lastUpdated: date,
      published: date,
      publishedBy,
      hidden: false,
      source: { url: uploadUrl(`${versionPath}/sources.tgz`), tarballHash: hashes.tarballHash, treeHash: hashes.treeHash },
      readme: { url: uploadUrl(`${versionPath}/README.md`), hash: hashes.readmeHash },
    };
    await Versions.updateAsync(version._id, { $set: modifier });

    const pack = await Packages.findOneAsync({ name: version.packageName });
    const $set = {};
    // Cache latest version
    if (!pack.latestVersion || versionMagnitude(pack.latestVersion.version) < version.versionMagnitude) {
      $set.latestVersion = {
        id: version._id,
        description: version.description,
        version: version.version,
        readme: modifier.readme.url,
        published: date,
      };
    }
    // The package becomes visible once its first version is published
    if (pack.hidden) Object.assign($set, { hidden: false, lastUpdated: date });
    if (Object.keys($set).length) await Packages.updateAsync(pack._id, { $set });

    console.log(`Published package version ${version._id}`);
    return true;
  },

  async createPackageBuild(data) {
    await checkAccess('canPublish', this.userId);
    validate(CreatePackageBuildSchema, data);

    const pack = await Packages.findOneAsync({ name: data.packageName, private: true });
    const version = await Versions.findOneAsync({ packageName: data.packageName, version: data.version, private: true });
    if (!pack || !version) throw new Meteor.Error('Unknown private package or version');

    if (await Builds.findOneAsync({ versionId: version._id, buildArchitectures: data.buildArchitectures })) {
      throw new Meteor.Error('Build already exists');
    }

    const buildId = await Builds.insertAsync({
      buildArchitectures: data.buildArchitectures,
      versionId: version._id,
      lastUpdated: new Date(),
      hidden: true,
      private: true,
      buildPackageName: data.packageName,
    });
    const token = await createUploadToken({ type: 'build', buildId, packageId: pack._id, versionId: version._id });

    console.log(`Create package build ${buildId}`);
    return { uploadToken: token, uploadUrl: uploadUrl(`?token=${token}&type=build`) };
  },

  async publishPackageBuild(uploadToken, tarballHash, treeHash) {
    await checkAccess('canPublish', this.userId);
    check(uploadToken, String);
    check(tarballHash, String);
    check(treeHash, String);

    const tokenData = await consumeUploadToken(uploadToken, 'build');
    const build = await Builds.findOneAsync({ _id: tokenData.buildId });
    if (!build) throw new Meteor.Error('Invalid upload token');

    const date = new Date();
    await Builds.updateAsync(build._id, {
      $set: {
        build: {
          treeHash,
          tarballHash,
          url: uploadUrl(`${tokenData.packageId}/versions/${tokenData.versionId}/builds/${tokenData.buildId}/build.tgz`),
        },
        builtBy: await userRef(this.userId),
        hidden: false,
        lastUpdated: date,
        buildPublished: date,
      },
    });

    console.log(`Published package build ${build._id}`);
    return true;
  },

  async createReadme(versionIdentifier) {
    validate(VersionIdentifierSchema, versionIdentifier);
    await checkAccess('canPublish', this.userId);

    const pack = await Packages.findOneAsync({ name: versionIdentifier.packageName, private: true });
    const version = await Versions.findOneAsync(versionIdentifier);
    if (!pack || !version) throw new Meteor.Error('404', 'Unknown private package or version');

    const token = await createUploadToken({ type: 'readme', versionId: version._id, packageId: pack._id });
    console.log(`Allow publication of readme for version ${version._id}`);
    return { uploadToken: token, url: uploadUrl(`?token=${token}`) };
  },

  async publishReadme(uploadToken, options) {
    await checkAccess('canPublish', this.userId);
    check(uploadToken, String);
    check(options, { hash: String });

    const tokenData = await consumeUploadToken(uploadToken, 'readme');
    const version = await Versions.findOneAsync({ _id: tokenData.versionId });
    if (!version) throw new Meteor.Error('Unknown version data');

    // XXX: verify hash
    await Versions.updateAsync(version._id, {
      $set: {
        readme: { hash: options.hash, url: uploadUrl(`${tokenData.packageId}/versions/${tokenData.versionId}/README.md`) },
        lastUpdated: new Date(),
      },
    });
    console.log(`Published readme for version ${version._id}`);
  },

  async changeVersionMetadata(versionIdentifier, data) {
    await checkAccess('canPublish', this.userId);
    validate(VersionIdentifierSchema, versionIdentifier);
    validate(ChangeVersionMetadataSchema, data);

    const pack = await Packages.findOneAsync({ name: versionIdentifier.packageName, private: true });
    const version = await Versions.findOneAsync({ ...versionIdentifier, private: true });
    if (!pack || !version) throw new Meteor.Error('Unknown private package or version');

    await Versions.updateAsync(version._id, { $set: { ...data, lastUpdated: new Date() } });
    if (pack.latestVersion?.id === version._id) {
      await Packages.updateAsync(pack._id, { $set: { 'latestVersion.description': data.description } });
    }
    console.log(`Changed version metadata for version ${version._id}`);
    return true;
  },

  async _changePackageHomepage(name, url) {
    await checkAccess('canPublish', this.userId);
    const params = validate(ChangePackageHomepageSchema, { name, homepage: url });
    console.log('Changing package homepage');
    const updated = await Packages.updateAsync(
      { name: params.name, private: true },
      { $set: { homepage: params.homepage, lastUpdated: new Date() } },
    );
    if (!updated) throw new Meteor.Error('404', 'Package not found');
  },

  async _changeVersionMigrationStatus(name, version, migrated) {
    await checkAccess('canPublish', this.userId);
    const params = validate(ChangeVersionMigrationStatusSchema, { packageName: name, version, unmigrated: !migrated });
    console.log('Changing version migration state');
    const updated = await Versions.updateAsync(
      { packageName: params.packageName, version: params.version, private: true },
      { $set: { unmigrated: params.unmigrated } },
    );
    if (!updated) throw new Meteor.Error('404', 'Private version not found');
  },

  async addMaintainer(name, username) {
    await checkAccess('canPublish', this.userId);
    await modifyMaintainer('package', name, username, { $push: { maintainers: { username } } }); // XXX: retrieve user
  },

  async removeMaintainer(name, username) {
    await checkAccess('canPublish', this.userId);
    await modifyMaintainer('package', name, username, { $pull: { maintainers: { username } } });
  },

  async createReleaseTrack(data) {
    await checkAccess('canPublish', this.userId);
    return makePrivate('track', data, this.userId);
  },

  async createReleaseVersion(record) {
    await checkAccess('canPublish', this.userId);
    await createReleaseVersion(record, this.userId);
  },

  async createPatchReleaseVersion(record, patchFrom) {
    await checkAccess('canPublish', this.userId);
    check(patchFrom, String);
    // XXX: what exactly is this supposed to do?
    await createReleaseVersion(record, this.userId);
    await ReleaseVersions.updateAsync({ track: record.track, version: patchFrom }, { $set: { patchReleaseVersion: record.version } });
  },

  async addReleaseMaintainer(track, username) {
    await checkAccess('canPublish', this.userId);
    await modifyMaintainer('track', track, username, { $push: { maintainers: { username } } }); // XXX: retrieve user
  },

  async removeReleaseMaintainer(track, username) {
    await checkAccess('canPublish', this.userId);
    await modifyMaintainer('track', track, username, { $pull: { maintainers: { username } } });
  },

  async recommendVersion(track, version) {
    await checkAccess('canPublish', this.userId);
    await setRecommendationStatus(track, version, true);
  },

  async unrecommendVersion(track, version) {
    await checkAccess('canPublish', this.userId);
    await setRecommendationStatus(track, version, false);
  },

  async setBannersOnReleases() {
    await checkAccess('canPublish', this.userId);
    // XXX
  },
});
