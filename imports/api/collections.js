import { Mongo } from 'meteor/mongo';

// Catalog collections, mirroring the ones meteor-tool syncs via syncNewPackageData.
export const Packages = new Mongo.Collection('packages');
export const Versions = new Mongo.Collection('versions');
export const Builds = new Mongo.Collection('builds');
export const ReleaseTracks = new Mongo.Collection('releaseTracks');
export const ReleaseVersions = new Mongo.Collection('releaseVersions');
