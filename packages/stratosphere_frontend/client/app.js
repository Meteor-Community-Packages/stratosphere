// This code only runs on the client
angular.module('stratosphere',[
  'stratosphere.dependencies',
  'stratosphere.list',
  'stratosphere.details',
])
    .config(configureRoutes)
    .constant('$types',{
      package:{
        id: 'package',
        label:'package',
        versionLabel:'version',
        collection:Packages,
        versionsCollection:Versions,
        count:'nbPackages',
        versionsCount:'nbVersions',
        linkedBy:'packageName',
        unpublish:'unPublishPackage',
        unpublishVersion:'unPublishVersion',
        subscribeList:'stratosphere/packages',
        subscribeDetails:'stratosphere/package',
        subscribeVersions:'stratosphere/versions',
        subscribeVersion:'stratosphere/version'
      },
      track:{
        id: 'track',
        label:'release track',
        versionLabel:'release version',
        collection:ReleaseTracks,
        versionsCollection:ReleaseVersions,
        count:'nbTracks',
        versionsCount:'nbReleaseVersions',
        linkedBy:'track',
        unpublish:'unPublishReleaseTrack',
        unpublishVersion:'unPublishReleaseVersion',
        subscribeList:'stratosphere/releaseTracks',
        subscribeDetails:'stratosphere/releaseTrack',
        subscribeVersions:'stratosphere/releaseVersions',
        subscribeVersion:'stratosphere/releaseVersion'
      }
    });

configureRoutes.$inject = ['$urlRouterProvider'];
function configureRoutes($urlRouterProvider){
  $urlRouterProvider.otherwise('/package/list/lastUpdated')
}
