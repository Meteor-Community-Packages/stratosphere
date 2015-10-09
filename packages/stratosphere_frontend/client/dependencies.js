angular.module('stratosphere.dependencies',[
  'ui.router',
  'angular-meteor',
  'ngSanitize',
  'btford.markdown',
  'ngMaterial',
  'infinite-scroll'
])
  .config(configureIcons);

configureIcons.$inject = ['$mdIconProvider'];

function configureIcons($mdIconProvider){
  $mdIconProvider
    .defaultIconSet('img/icons/sets/core-icons.svg', 24);
}

