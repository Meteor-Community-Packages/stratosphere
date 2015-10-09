angular
  .module("stratosphere.package",[])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('package', {
      url: "/package/:id",
      templateUrl: 'stratosphere_frontend_client/package/view.ng.html',
      controller: 'stPackageCtrl',
      controllerAs: 'vm'
    });
}