Package.describe({
  name: "stratosphere:synchronizer",
  summary: "Stratosphere Upstream Synchronization package",
  version: "1.0.0-alpha2",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.1.0.2']);

  api.use([
    'stratosphere:lib@1.0.0-alpha2',
    'stratosphere:schemas@1.0.0-alpha2'
  ],['server']);

  api.addFiles([
    'server/startup/upstream.js',
    'server/synchronizer.js'
  ], ['server']);

  api.export(['Synchronizer']);

});