angular
  .module("stratosphere.packages",[])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('packages', {
      url: "/packages/:sort",
      templateUrl: 'stratosphere_frontend_client/packages/view.ng.html',
      controller: 'stPackagesCtrl',
      controllerAs: 'vm'
    });
}