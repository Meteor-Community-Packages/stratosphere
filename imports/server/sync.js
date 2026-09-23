import { promisify } from 'node:util';
import zlib from 'node:zlib';
import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp';
import { Tracker } from 'meteor/tracker';
import { Builds, Metadata, Packages, ReleaseTracks, ReleaseVersions, Versions } from './collections';
import { SyncOptionsSchema, SyncTokenSchema, validate } from './schemas';
import { checkAccess, toArrayFromObj, toObjFromArray } from './utils';
import { versionMagnitude } from '/imports/api/versionMagnitude';

const collections = {
  packages: Packages,
  versions: Versions,
  builds: Builds,
  releaseVersions: ReleaseVersions,
  releaseTracks: ReleaseTracks,
};

let upstream;

/** Connects to the upstream package server (packages.meteor.com). */
export function connectToUpstream() {
  const { upstreamURL } = Meteor.settings;
  if (!upstreamURL) return;
  upstream = DDP.connect(upstreamURL);
  Tracker.autorun(() => {
    const { connected } = upstream.status();
    console.log(`Upstream ${connected ? 'connected' : 'disconnected'}: ${upstreamURL}`);
  });
}

const getMetadata = async key => (await Metadata.findOneAsync({ key }))?.value;
const setMetadata = (key, value) => Metadata.updateAsync({ key }, { $set: { value } });

/** Ensures the metadata documents the sync protocol relies on exist. */
export async function setupMetadata() {
  if ((await getMetadata('syncToken')) === undefined) {
    await Metadata.insertAsync({ key: 'syncToken', value: { format: '1.1' } });
  }
  if ((await getMetadata('lastDeletion')) === undefined) {
    await Metadata.insertAsync({ key: 'lastDeletion', value: 0 });
  }
}

/**
 * Fetches all new data from the upstream package server into our collections.
 * Public (upstream) records whose name clashes with a private package get an "-UPSTREAM" suffix.
 * Concurrent callers share the sync that is already running.
 */
let runningSync;
const synchronizeWithUpstream = () => (runningSync ??= runUpstreamSync().finally(() => (runningSync = undefined)));

async function runUpstreamSync() {
  // If there is no connection to an upstream server, we cannot synchronize
  if (!upstream?.status().connected) return;

  console.log('Start syncing with upstream');
  let syncToken = await getMetadata('syncToken');
  let chunk = 0;
  let upToDate = false;

  while (!upToDate) {
    console.log(`Fetch upstream chunk ${++chunk}`);
    let remoteData;
    try {
      remoteData = await upstream.callAsync('syncNewPackageData', syncToken, {});
    } catch (e) {
      throw new Meteor.Error(`Error while syncing with upstream package server: ${e}`);
    }

    if (remoteData.resetData) {
      console.log('Reset datastore as per upstream command');
      for (const collection of Object.values(collections)) {
        await collection.removeAsync({ private: false });
      }
    }

    for (const [collectionName, collection] of Object.entries(collections)) {
      for (const element of remoteData.collections?.[collectionName] ?? []) {
        await prepareUpstreamRecord(element, collectionName);
        const { _id, ...fields } = element;
        await collection.upsertAsync(_id, { $set: fields });
      }
    }

    syncToken = remoteData.syncToken;
    await setMetadata('syncToken', syncToken);
    if ((await getMetadata('lastDeletion')) < syncToken.lastDeletion) {
      await setMetadata('lastDeletion', syncToken.lastDeletion);
    }
    upToDate = remoteData.upToDate;
  }

  console.log('Finished syncing with upstream');
}

async function prepareUpstreamRecord(element, collectionName) {
  const nameKey = { packages: 'name', versions: 'packageName' }[collectionName];
  if (collectionName === 'versions') {
    // Make dependencies Mongo-safe (package names contain dots)
    element.dependencies = toArrayFromObj(element.dependencies, 'packageName');
  }

  // If a private package with this name already exists, the upstream one gets renamed
  if (nameKey) {
    const pack = await Packages.findOneAsync({ name: element[nameKey], private: true }, { fields: { _id: 1 } });
    if (pack) {
      element[nameKey] = `${element[nameKey]}-UPSTREAM`;
      element.lastUpdated = new Date();
      if (collectionName === 'packages') {
        await Packages.updateAsync(pack._id, { $set: { upstream: element._id } });
      }
    }
  }

  // To easily query versions, add a sortable representation of the version
  if ('version' in element) element.versionMagnitude = versionMagnitude(element.version);
  element.hidden = false;
  element.private = false;
}

const gzip = promisify(zlib.gzip);
const hiddenFields = { latestVersion: 0, upstream: 0, private: 0, hidden: 0, buildPackageName: 0, versionMagnitude: 0 };

Meteor.methods({
  /**
   * Returns all changes to the package DB since the given syncToken, in pages.
   * See meteor-tool's packaging/package-client.js for the consumer.
   */
  async syncNewPackageData(syncToken, syncOptions = {}) {
    await checkAccess('canSynchronize', this.userId);
    validate(SyncTokenSchema, syncToken);
    validate(SyncOptionsSchema, syncOptions);

    // XXX: check format version and do something with it
    const perPage = syncOptions.useShortPages ? 10 : 500;

    await synchronizeWithUpstream();

    const result = { collections: {}, upToDate: true, resetData: false, syncToken };
    const lastDeletion = await getMetadata('lastDeletion');

    // If the syncToken is from a non-stratosphere package server or stale, reset everything
    if (!syncToken.stratosphere || syncToken.lastDeletion == null || lastDeletion > syncToken.lastDeletion) {
      result.resetData = true;
      syncToken.stratosphere = true;
      syncToken.lastDeletion = lastDeletion;
      for (const collectionName of Object.keys(collections)) syncToken[collectionName] = 0;
    }

    for (const [collectionName, collection] of Object.entries(collections)) {
      const selector = { lastUpdated: { $gt: new Date(syncToken[collectionName] ?? 0) } };
      // meteor-tool expects every collection key, even when there are no changes
      result.collections[collectionName] = [];
      const count = await collection.find(selector).countAsync();
      if (!count) continue;
      if (count > perPage) result.upToDate = false;

      const records = await collection
        .find(selector, { sort: { lastUpdated: 1 }, limit: perPage, fields: hiddenFields })
        .fetchAsync();

      // Revert Mongo-safe dependencies to the way meteor-tool wants them
      if (collectionName === 'versions') {
        for (const record of records) record.dependencies = toObjFromArray(record.dependencies, 'packageName');
      }

      result.collections[collectionName] = records;
      syncToken[collectionName] = new Date(records.at(-1).lastUpdated).getTime();
    }

    if (syncOptions.compressCollections) {
      result.collectionsCompressed = (await gzip(JSON.stringify(result.collections))).toString('base64');
      delete result.collections;
    }

    return result;
  },
});
