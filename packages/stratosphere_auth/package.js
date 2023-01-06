Package.describe({
  name: 'stratosphere:auth',
  summary: 'Stratosphere authorization package',
  version: '1.0.0-rc1',
  git: 'https://github.com/sebakerckhof/stratosphere.git'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.3.4']);

  api.use([
    'ecmascript',
    'webapp',
    'mongo',
    'routepolicy',
    'simonrycroft:ip-whitelist',
    'stratosphere:collections'
  ], ['server']);

  api.addFiles([
    'server/authServer.js',
    'server/utils.js',
    'server/whitelisting.js',
    'server/startup/server.js'
  ], ['server']);

  Npm.depends({
    'range_check': '1.4.0'
  });

});