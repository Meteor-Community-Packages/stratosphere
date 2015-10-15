Package.describe({
  name: "stratosphere:core",
  summary: "Stratosphere Main package",
  version: "1.0.0-beta1",
  git: "https://github.com/sebakerckhof/stratosphere.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'stratosphere:lib',
    'stratosphere:collections',
    'stratosphere:synchronizer',
    'stratosphere:uploads'
  ]);

  api.imply([
    'stratosphere:collections'
  ]);



  api.addFiles([], ['server','client']);

  api.addFiles([], ['client']);

  api.addFiles([
    'server/utils/addMaintainer.js',
    'server/utils/removeMaintainer.js',
    'server/utils/makePrivate.js',
    'server/utils/publishPackage.js',
    'server/utils/setRecommendationStatus.js',

      //RPC's
    'server/rpc/gui/unPublishPackage.js',
    'server/rpc/gui/unPublishReleaseTrack.js',
    'server/rpc/gui/unPublishReleaseVersion.js',
    'server/rpc/gui/unPublishVersion.js',

    'server/rpc/meteortool/_changePackageHomepage.js',
    'server/rpc/meteortool/_changeVersionMigrationStatus.js',
    'server/rpc/meteortool/addMaintainer.js',
    'server/rpc/meteortool/addReleaseMaintainer.js',
    'server/rpc/meteortool/changeVersionMetadata.js',
    'server/rpc/meteortool/createPackage.js',
    'server/rpc/meteortool/createPackageBuild.js',
    'server/rpc/meteortool/createPackageVersion.js',
    'server/rpc/meteortool/createPatchReleaseVersion.js',
    'server/rpc/meteortool/createReadme.js',
    'server/rpc/meteortool/createReleaseTrack.js',
    'server/rpc/meteortool/createReleaseVersion.js',
    'server/rpc/meteortool/publishPackageBuild.js',
    'server/rpc/meteortool/publishPackageVersion.js',
    'server/rpc/meteortool/publishReadme.js',
    'server/rpc/meteortool/recommendVersion.js',
    'server/rpc/meteortool/refresh.js',
    'server/rpc/meteortool/removeMaintainer.js',
    'server/rpc/meteortool/removeReleaseMaintainer.js',
    'server/rpc/meteortool/setBannersOnReleases.js',
    'server/rpc/meteortool/syncNewPackageData.js',
    'server/rpc/meteortool/unrecommendVersion.js',

      //publications
    'server/publications/nbPackages.js',
    'server/publications/package.js',
    'server/publications/packages.js',
    'server/publications/releaseTrack.js',
    'server/publications/releaseTracks.js',
    'server/publications/releaseVersion.js',
    'server/publications/releaseVersions.js',
    'server/publications/search.js',
    'server/publications/version.js',
    'server/publications/versions.js'
  ], ['server']);

  Npm.depends({
    "wrench":"1.5.8",
    "fs-extra":"0.19.0"
  });

});