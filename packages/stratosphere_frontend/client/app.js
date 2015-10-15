// This code only runs on the client
angular.module('stratosphere',[
  'stratosphere.dependencies',
  'stratosphere.list',
  'stratosphere.details',
])
    .config(configureRoutes)
    .run(handleStateChangeErrors)
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

configureRoutes.$inject = ['$stateProvider','$urlRouterProvider'];
function configureRoutes($stateProvider,$urlRouterProvider){
  $stateProvider
      .state('forbidden', {
        url: "/forbidden",
        template: '<h2>Forbidden</h2>',
      });

  $urlRouterProvider.otherwise('/package/list/lastUpdated')
}

handleStateChangeErrors.$inject = ["$rootScope", "$state", "$mdToast"];

function handleStateChangeErrors($rootScope, $state, $mdToast) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $meteor.requireUser() promise is rejected
    // or the custom error, and redirect the user back to the login page
    switch(error) {
      case "AUTH_REQUIRED":
        $state.go('logIn');
        break;
      case "FORBIDDEN":
        $state.go('forbidden');
        break;
      case "UNAUTHORIZED":
        $state.go('forbidden');
        break;
      default:
        $mdToast.show($mdToast.simple().content('Internal error'));
    }
  });
}