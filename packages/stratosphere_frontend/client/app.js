// This code only runs on the client
angular.module('stratosphere',[
  'stratosphere.dependencies',
  'stratosphere.list',
  'stratosphere.details',
  'stratosphere.users',
])
    .config(configureRoutes)
    .run(handleStateChangeErrors)
    .run(defaultSubscriptions)
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
        unpublish:'/stratosphere/unPublishPackage',
        unpublishVersion:'/stratosphere/unPublishVersion',
        subscribeList:'/stratosphere/packages',
        subscribeDetails:'/stratosphere/package',
        subscribeVersions:'/stratosphere/versions',
        subscribeVersion:'/stratosphere/version'
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
        unpublish:'/stratosphere/unPublishReleaseTrack',
        unpublishVersion:'/stratosphere/unPublishReleaseVersion',
        subscribeList:'/stratosphere/releaseTracks',
        subscribeDetails:'/stratosphere/releaseTrack',
        subscribeVersions:'/stratosphere/releaseVersions',
        subscribeVersion:'/stratosphere/releaseVersion'
      }
    });

configureRoutes.$inject = ['$stateProvider','$urlRouterProvider'];
function configureRoutes($stateProvider,$urlRouterProvider){
  $stateProvider
      .state('whitelist', {
        url: "/whitelist",
        template: "<h2>whitelist</h2>"
      })
      .state('forbidden', {
        url: "/forbidden",
        template: '<h2>Forbidden</h2>',
      })
      .state('login', {
        url: "/login",
        templateUrl: 'stratosphere_frontend_client/login.ng.html',
        controller: 'LoginCtrl',
        controllerAs: 'vm'
      });

  $urlRouterProvider.otherwise('/package/list/lastUpdated')
}

handleStateChangeErrors.$inject = ["$rootScope", "$state", "$mdToast", "$meteor"];
function handleStateChangeErrors($rootScope, $state, $mdToast, $meteor) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    console.log(event)
    console.log(toState)
    console.log(toParams)
    console.log(fromParams)
    console.log(fromState)
    console.log(error)

    // We can catch the error thrown when the $meteor.requireUser() promise is rejected
    // or the custom error, and redirect the user back to the login page
    switch(error) {
      case "AUTH_REQUIRED":
        //$state.go('login');
        $meteor.loginWithMeteorDeveloperAccount().then(function(){
         // $history.previous();
        }, function(err){
          console.log('Login error - ', err.msg);
          $mdToast.show(
              $mdToast.simple()
                  .content("Login error: "+err.msg)
          );
          $state.go('forbidden');
        });
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

defaultSubscriptions.$inject = ["$meteor"];
function defaultSubscriptions($meteor){
  $meteor.subscribe('/stratosphere/loggedInUser');
}