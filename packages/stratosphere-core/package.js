Package.describe({
  name: "stratosphere:core",
  summary: "Stratosphere Main package",
  version: "1.0.0-alpha2",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.1.0.2']);

  api.use([
    'stratosphere:lib@1.0.0-alpha2',
    'stratosphere:schemas@1.0.0-alpha2',
    'stratosphere:synchronizer@1.0.0-alpha2',
    'stratosphere:uploads@1.0.0-alpha2'
  ]);

  api.addFiles([
    'client/style/style.scss',
    'client/helpers/config.js',
    'client/helpers/errors.js',
    'client/helpers/handlebars.js',
    'client/templates/application/layout.html',
    'client/templates/application/layout.js',
    'client/templates/application/not_found.html',
    'client/templates/includes/access_denied.html',
    'client/templates/includes/errors.html',
    'client/templates/includes/errors.js',
    'client/templates/includes/header.html',
    'client/templates/includes/header.js',
    'client/templates/includes/loading.html',
    'client/templates/packages/package_details.html',
    'client/templates/packages/package_details.js',
    'client/templates/packages/package_item.html',
    'client/templates/packages/package_item.js',
    'client/templates/packages/package_list.html',
    'client/templates/packages/package_list.js',
    'client/templates/versions/version_item.html',
    'client/templates/versions/version_item.js',
    'client/app.js',
    'client/main.html',
  ], ['client']);

  api.addFiles([
    'lib/router.js',
    'lib/methods.js'
  ], ['server','client']);

  api.addFiles([
    'server/login.js',
    'server/publications.js',
    'server/methods.js'
  ], ['server']);

  Npm.depends({
    "wrench":"1.5.8",
    "fs-extra":"0.19.0"
  });

});