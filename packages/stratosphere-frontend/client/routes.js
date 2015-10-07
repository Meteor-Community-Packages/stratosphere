angular
  .module("stratosphere")
  .config(configureRoutes);


configureRoutes.$inject = ['$urlRouterProvider', '$stateProvider', '$locationProvider'];
function configureRoutes($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  //$locationProvider.html5Mode(false);

  $stateProvider
    .state('list', {
      url: "/:sort",
      templateUrl: 'stratosphere-frontend_client/index.ng.html',
      controller: 'stListCtrl',
      controllerAs: 'listVM'
    })
    .state('package', {
      url: "/:id",
      templateUrl: 'stratosphere-frontend_client/details/details.ng.html',
      controller: 'stDetailsCtrl',
      controllerAs: 'detailsVM'
    });
}