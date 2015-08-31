Package.describe({
  name: "stratosphere:collections",
  summary: "Stratosphere Models/Schemas package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['1.2-rc.8']);

  api.use([
    'stratosphere:lib'
  ]);

  api.addFiles([
      //Collections
    'shared/collections/builds.js',
    'shared/collections/metadata.js',
    'shared/collections/packages.js',
    'shared/collections/releaseTracks.js',
    'shared/collections/releaseVersions.js',
    'shared/collections/uploadTokens.js',
    'shared/collections/versions.js',

      //Schemas
    'shared/schemas.js',
    'shared/schemas/builds.js',
    'shared/schemas/metadata.js',
    'shared/schemas/packages.js',
    'shared/schemas/releaseTracks.js',
    'shared/schemas/releaseVersions.js',
    'shared/schemas/uploadTokens.js',
    'shared/schemas/versions.js',

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