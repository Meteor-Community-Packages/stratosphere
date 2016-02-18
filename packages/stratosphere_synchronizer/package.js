Package.describe({
  name: "stratosphere:synchronizer",
  summary: "Stratosphere Upstream Synchronization package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'ecmascript',
    'stratosphere:lib',
    'stratosphere:collections'
  ],['server']);

  api.addFiles([
    'server/startup/upstream.js',
    'server/synchronizer.js'
  ], ['server']);

});