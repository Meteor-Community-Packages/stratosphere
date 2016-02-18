Package.describe({
  name: "stratosphere:lib",
  summary: "Stratosphere Library package",
  version: "1.0.0-rc1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  var packages = [
    'meteor-base',
    'check',
    'mongo',
    'session',
    'tracker',
    //'meteortoys:allthings@2.1.0',
    'accounts-password',

    'package-version-parser',
    'service-configuration',
    'accounts-oauth',
    'accounts-meteor-developer',
    'aldeed:simple-schema@1.3.3',
    'meteorhacks:search-source@1.4.0',
    'percolate:find-from-publication@0.1.0',
    'tmeasday:publish-counts@0.3.9',
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