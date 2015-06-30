Package.describe({
  name: "stratosphere:schemas",
  summary: "Stratosphere Models/Schemas package",
  version: "1.0.0-alpha2",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  api.use([
    'stratosphere:lib@1.0.0-alpha2'
  ]);

  api.addFiles([
    'lib/collections.js',
  ], ['server','client']);

  api.addFiles([
    'server/startup/indexes.js',
    'server/startup/fixtures.js',
    'server/schemas.js'
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