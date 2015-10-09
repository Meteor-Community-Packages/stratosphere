Package.describe({
  name: "stratosphere:collections",
  summary: "Stratosphere Models/Schemas package",
  version: "1.0.0-beta1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'stratosphere:lib'
  ]);

  api.addFiles([
    //BaseSchemas
    'shared/schemas.js',

      //Collections
    'shared/collections/builds.js',
    'shared/collections/metadata.js',
    'shared/collections/packages.js',
    'shared/collections/releaseTracks.js',
    'shared/collections/releaseVersions.js',
    'shared/collections/syncTokens.js',
    'shared/collections/uploadTokens.js',
    'shared/collections/versions.js',

  ], ['server','client']);

  api.addFiles([
    'server/startup/fixtures.js'
  ], ['server']);

  api.export([
    'Packages',
    'Versions',
    'Builds',
    'ReleaseTracks',
    'ReleaseVersions',
    'Metadata',
    'UploadTokens'
  ]);
});