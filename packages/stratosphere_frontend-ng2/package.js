Package.describe({
    name: "stratosphere:frontendng2",
    summary: "Stratosphere Frontend",
    version: "1.0.0-rc1",
    git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

    api.versionsFrom(['METEOR@1.2.0.2']);

    api.use([
        'static-html',
        'stratosphere:core',
        'shmck:angular2@2.0.4',
        'shmck:angular2-router@2.0.3',
        //'netanelgilad:angular2-typescript@0.0.3',
        'sclausen:angular2-typescript@1.0.1',
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
        'client/app.ts',
        'client/index.html',
    ], ['client']);


    api.addFiles([
    ], ['server']);

    Npm.depends({
        "wrench":"1.5.8",
        "fs-extra":"0.19.0"
    });

});