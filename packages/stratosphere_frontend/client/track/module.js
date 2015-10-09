angular
  .module("stratosphere.track",['stratosphere.dependencies'])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('track', {
      url: "/track/:name",
      templateUrl: 'stratosphere_frontend_client/track/view.ng.html',
      controller: 'stTrackCtrl',
      controllerAs: 'vm'
    });
}