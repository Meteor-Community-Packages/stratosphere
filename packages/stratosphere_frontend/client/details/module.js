angular
  .module("stratosphere.details",['stratosphere.dependencies'])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('details', {
      url: "/{type:(?:package|track)}/details/:name",
      templateUrl: 'stratosphere_frontend_client/details/details.ng.html',
      controller: 'stDetailsCtrl',
      controllerAs: 'vm'
    });
}