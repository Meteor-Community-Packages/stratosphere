// This code only runs on the client
angular.module('stratosphere',[
  'stratosphere.dependencies',
  'stratosphere.packages',
  'stratosphere.package',
  'stratosphere.tracks',
  'stratosphere.track'
])
  .config(configureRoutes);

configureRoutes.$inject = ['$urlRouterProvider'];
function configureRoutes($urlRouterProvider){
  $urlRouterProvider.otherwise('/packages/lastUpdated')
}
