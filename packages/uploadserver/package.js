Package.describe({
    name: 'uploadserver',
    summary: 'Based of tomi:upload-server',
    version: '1.0.0-rc1'
});

Package.onUse(function(api) {
    api.versionsFrom('METEOR@1.2.0.2');

    api.use(['webapp','ecmascript', 'routepolicy'], 'server');

    api.addFiles('server.js', ['server']);
    // Export the object 'UploadServer' to packages or apps that use this package.
    api.export('UploadServer', 'server');
});


Npm.depends({
    formidable: '1.0.15',
    wrench: '1.5.8',
    connect: '2.7.10'
})