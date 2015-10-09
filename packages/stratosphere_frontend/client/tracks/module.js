angular
  .module("stratosphere.tracks",[])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('tracks', {
      url: "/tracks/:sort",
      templateUrl: 'stratosphere_frontend_client/tracks/view.ng.html',
      controller: 'stTracksCtrl',
      controllerAs: 'vm'
    });
}