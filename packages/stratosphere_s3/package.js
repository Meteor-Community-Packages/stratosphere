Package.describe({
  name: 'stratosphere:s3',
  summary: 'Stratosphere S3 Sync package',
  version: '1.0.0-rc1',
  git: 'https://github.com/sebakerckhof/stratosphere.git'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.3.4']);

  api.use([
    'ecmascript',
    'stratosphere:collections'
  ]);

  api.addFiles([
    'server/buildObserver.js',
    'server/sync.js',
    'server/utils.js',
    'server/startup/server.js'
  ], ['server']);

  api.export([
    'Stratosphere'
  ]);

  Npm.depends({
    'aeris-s3-sync': '1.0.1',
    'hound': '1.0.5'
  });
});