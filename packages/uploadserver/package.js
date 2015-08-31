Package.describe({
    name: 'uploadserver',
    summary: 'Based of tomi:upload-server',
    version: '1.0.0-rc1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2-rc.8');

    api.use(['webapp', 'routepolicy'], 'server');

    api.addFiles('server.js', ['server']);
    // Export the object 'UploadServer' to packages or apps that use this package.
    api.export('UploadServer', 'server');
});

//Package.onTest(function(api) {
//  api.use('tinytest');
//  api.use('tomi:upload-server');
//  api.addFiles('upload-server-tests.js');
//});

Npm.depends({
    formidable: '1.0.15',
    wrench: '1.5.8',
    connect: '2.7.10'
})