// This code only runs on the client
angular.module('stratosphere',['angular-meteor','ngMaterial','stratosphere.components'])
  .config(configureIcons);

configureIcons.$inject = ['$mdIconProvider'];

function configureIcons($mdIconProvider){
  $mdIconProvider
    .defaultIconSet('img/icons/sets/core-icons.svg', 24);
}

