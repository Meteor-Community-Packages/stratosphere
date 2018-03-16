Package.describe({
    name: "stratosphere:frontend",
    summary: "Stratosphere Frontend",
    version: "1.0.0-rc1",
    git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

    api.versionsFrom(['METEOR@1.6']);

    api.use([
        'static-html',
        'stratosphere:core',
        'angular:angular@1.4.7',
        'angular:angular-animate@1.4.7',
        'angular:angular-aria@1.4.7',
        'angular:angular-resource@1.4.7',
        'angular:angular-sanitize@1.4.7',
        'divramod:angular-markdown-directive@0.0.1',
        'angular',
        'ecmascript',
        'angular:angular-material@0.11.2',
        'angularui:angular-ui-router@0.2.15',
        'netanelgilad:ng-infinite-scroll@1.2.0_1',
        'jquery',
        'fortawesome:fontawesome@4.4.0',
        'fourseven:scss@4.5.4'
    ]);

    api.addFiles([], ['server','client']);

    api.addFiles([
        'client/dependencies.js',

        //modules
            'client/details/module.js',
            'client/details/stDetailsCtrl.js',
            'client/details/stVersionCtrl.js',
            'client/details/version.ng.html',
            'client/details/details.ng.html',

            'client/list/module.js',
            'client/list/stListCtrl.js',
            'client/list/list.ng.html',

            'client/users/module.js',
            'client/users/stUsersCtrl.js',
            'client/users/stPermissionsCtrl.js',
            'client/users/users.ng.html',
            'client/users/permissions.ng.html',


        'client/app.js',
        'client/history.js',

        'client/IndexCtrl.js',
        'client/index.html',

        'client/InstructionsCtrl.js',
        'client/instructions.ng.html',

        'client/LoginCtrl.js',
        'client/login.ng.html',

        'client/main.scss',

    ], ['client']);

    api.addFiles([], ['server']);

});