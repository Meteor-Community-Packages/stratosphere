Package.describe({
  name: "stratosphere:lib",
  summary: "Stratosphere Library package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['1.2-rc.8']);

  var packages = [
    'meteor-base',
    'mongo',
    'session',
    'tracker',
    'accounts-password',
    'ecmascript',
    'package-version-parser',
    'service-configuration',
    //'accounts-oauth',
    //'accounts-meteor-developer',
    'aldeed:simple-schema@1.3.3',
    'meteorhacks:search-source@1.4.0',
    'percolate:find-from-publication@0.1.0',
    'tmeasday:publish-counts@0.3.9',
    'mrt:q@1.0.1',
    'meteorhacks:async@1.0.0'
  ];

  api.imply(packages);

  api.use(packages);

  api.export([
    'Stratosphere'
  ]);

  api.addFiles([
    'namespace.js',
    'utils.js'
  ], ['server','client']);



  Npm.depends({
    "semver-loose":"0.2.0",
    "wrench":"1.5.8",
    "fs-extra":"0.19.0"
  });

});