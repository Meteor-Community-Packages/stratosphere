Package.describe({
  name: "stratosphere:collections",
  summary: "Stratosphere Models/Schemas package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'ecmascript',
    'stratosphere:lib'
  ]);

  api.addFiles([
      //Collections
    'shared/collections/builds.js',
    'shared/collections/packages.js',
    'shared/collections/releaseTracks.js',
    'shared/collections/releaseVersions.js',
    'shared/collections/versions.js',

  ], ['server','client']);

  api.addFiles([
    //Collections
    'server/collections/metadata.js',
    'server/collections/uploadTokens.js',
    'server/collections/ipWhitelist.js',


    //schemas
    'server/schemas/general.js',

    'server/schemas/builds.js',
    'server/schemas/packages.js',
    'server/schemas/releaseTracks.js',
    'server/schemas/releaseVersions.js',
    'server/schemas/syncTokens.js',
    'server/schemas/uploadTokens.js',
    'server/schemas/versions.js',
    'server/schemas/ipWhitelists.js',

    'server/startup/fixtures.js'
  ], ['server']);

  api.export([
    'Packages',
    'Versions',
    'Builds',
    'ReleaseTracks',
    'ReleaseVersions',
    'Metadata',
    'UploadTokens',
    'IpWhitelist'
  ]);
});