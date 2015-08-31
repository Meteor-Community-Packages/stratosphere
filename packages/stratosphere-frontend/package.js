Package.describe({
    name: "stratosphere:frontend",
    summary: "Stratosphere Frontend",
    version: "1.0.0-rc1",
    git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

    api.versionsFrom(['1.2-rc.8']);

    api.use([
        'static-html',
        'stratosphere:core',
        'shmck:angular2@2.0.4',
        'shmck:angular2-router@2.0.3',
        'netanelgilad:angular2-typescript@0.0.3',
        //ian:accounts-ui-bootstrap-3@1.2.56',
        //'twbs:bootstrap@3.3.4',
        'chuikoff:bootstrap-4@0.0.1',
        'chuikoff:accounts-ui-bootstrap-4@0.0.1',
        'fourseven:scss@3.2.0',
        'fortawesome:fontawesome@4.3.0'
    ]);

    api.addFiles([

    ], ['server','client']);

    api.addFiles([
        'client/style/style.scss',
        'client/app.js',
        'client/index.html',
    ], ['client']);



    api.addFiles([
    ], ['server']);

    Npm.depends({
        "wrench":"1.5.8",
        "fs-extra":"0.19.0"
    });

});