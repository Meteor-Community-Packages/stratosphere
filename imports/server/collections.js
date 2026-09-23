import { Mongo } from 'meteor/mongo';
import { Builds, Packages, ReleaseTracks, ReleaseVersions, Versions } from '/imports/api/collections';

export * from '/imports/api/collections';

export const Metadata = new Mongo.Collection('metadata');
export const UploadTokens = new Mongo.Collection('uploadTokens');
export const IpWhitelist = new Mongo.Collection('ipWhitelist');

export async function createIndexes() {
  const indexes = [
    [Metadata, { key: 1 }],
    [IpWhitelist, { ipAddress: 1 }],

    [Builds, { versionId: 1 }],
    [Builds, { versionId: 1, buildArchitectures: 1 }],
    [Builds, { private: 1 }],
    [Builds, { hidden: 1, lastUpdated: 1 }],

    [Packages, { name: 1 }],
    [Packages, { private: 1 }],
    [Packages, { private: 1, hidden: 1 }],
    [Packages, { name: 1, private: 1 }],
    [Packages, { name: 'text' }],
    [Packages, { hidden: 1, lastUpdated: 1 }],

    [ReleaseTracks, { name: 1 }],
    [ReleaseTracks, { private: 1 }],
    [ReleaseTracks, { hidden: 1, lastUpdated: 1 }],

    [ReleaseVersions, { track: 1 }],
    [ReleaseVersions, { private: 1 }],
    [ReleaseVersions, { track: 1, version: 1 }],
    [ReleaseVersions, { hidden: 1, lastUpdated: 1 }],

    [Versions, { packageName: 1 }],
    [Versions, { private: 1, hidden: 1 }],
    [Versions, { private: 1 }],
    [Versions, { packageName: 1, private: 1 }],
    [Versions, { packageName: 1, version: 1 }],
    [Versions, { versionMagnitude: 1 }],
    [Versions, { hidden: 1, lastUpdated: 1 }],
  ];
  await Promise.all(indexes.map(([collection, index]) => collection.createIndexAsync(index)));
}
