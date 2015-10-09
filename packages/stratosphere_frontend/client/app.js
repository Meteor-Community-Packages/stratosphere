// This code only runs on the client
angular.module('stratosphere',[
  'ui.router',
  'angular-meteor',
  'ngMaterial',
  'stratosphere.packages',
  'stratosphere.package',
  'stratosphere.tracks',
  'stratosphere.track'
])
  .config(configureIcons)
  .config(configureRoutes);

configureIcons.$inject = ['$mdIconProvider'];

function configureIcons($mdIconProvider){
  $mdIconProvider
    .defaultIconSet('img/icons/sets/core-icons.svg', 24);
}

configureRoutes.$inject = ['$urlRouterProvider'];
function configureRoutes($urlRouterProvider){
  $urlRouterProvider.otherwise('/packages/recent')
}
