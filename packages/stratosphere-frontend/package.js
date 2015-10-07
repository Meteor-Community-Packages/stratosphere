Package.describe({
    name: "stratosphere:frontend",
    summary: "Stratosphere Frontend",
    version: "1.0.0-rc1",
    git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

    api.versionsFrom(['METEOR@1.2.0.2']);

    api.use([
        'static-html',
        'stratosphere:core',
        'angular',
        'angular:angular-material',
        'angularui:angular-ui-router',
        //'bootstrap@4.0.0-alpha',
        'fourseven:scss@3.4.0-beta1',
        'fortawesome:fontawesome@4.4.0'
    ]);

    api.addFiles([

    ], ['server','client']);

    api.addFiles([
        'client/app.js',
        'client/routes.js',
        'client/index.html',
    ], ['client']);


    api.addFiles([
    ], ['server']);

    Npm.depends({
        "wrench":"1.5.8",
        "fs-extra":"0.19.0"
    });

});