Package.describe({
  name: "stratosphere:synchronizer",
  summary: "Stratosphere Upstream Synchronization package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['1.2-rc.8']);

  api.use([
    'stratosphere:lib',
    'stratosphere:collections'
  ],['server']);

  api.addFiles([
    'server/startup/upstream.js',
    'server/synchronizer.js'
  ], ['server']);

  api.export(['Synchronizer']);

});