angular
  .module("stratosphere.list",['stratosphere.dependencies'])
  .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('list', {
      url: "/{type:(?:package|track)}/list/:sort",
      templateUrl: 'stratosphere_frontend_client/list/list.ng.html',
      controller: 'stListCtrl',
      controllerAs: 'vm',
        resolve: {
          "currentUser": ["$meteor", function($meteor){
            return $meteor.requireUser();
          }]
        }
    });
}