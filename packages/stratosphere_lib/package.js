Package.describe({
  name: "stratosphere:lib",
  summary: "Stratosphere Library package",
  version: "1.0.0-rc2",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.6.0.1']);

  var packages = [
    'meteor-base',
    'check',
    'mongo',
    'session',
    'tracker',
    'accounts-password',
    'ecmascript',
    'package-version-parser',
    'service-configuration',
    'accounts-oauth',
    'accounts-meteor-developer',
    'aldeed:simple-schema@1.5.3',
    'meteorhacks:search-source@1.4.2',
    'percolate:find-from-publication@0.1.0',
    'tmeasday:publish-counts@0.7.3',
    'mrt:q@1.0.1',
    'meteorhacks:async@1.0.0'
  ];

  api.imply(packages);

  api.use(packages);
  api.use('ecmascript');

  api.export([
    'Stratosphere'
  ]);

  api.addFiles([
    'shared/namespace.js',
    'shared/utils.js'
  ], ['server','client']);


  api.addFiles([
    'server/utils.js'
  ], ['server']);


  Npm.depends({
    "wrench":"1.5.8",
    "fs-extra":"0.19.0"
  });

});
