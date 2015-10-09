angular
  .module("stratosphere.package",['stratosphere.dependencies'])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('package', {
      url: "/package/:name",
      templateUrl: 'stratosphere_frontend_client/package/view.ng.html',
      controller: 'stPackageCtrl',
      controllerAs: 'vm'
    });
}