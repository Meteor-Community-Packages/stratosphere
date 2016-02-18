angular.module('stratosphere.dependencies',[
  'ui.router',
  'angular-meteor',
  'angular-meteor.auth',
  'ngSanitize',
  'btford.markdown',
  'ngMaterial',
  'infinite-scroll'
])
    .config(configureIcons)
    .filter('prettyJSON', function () {
      function syntaxHighlight(json) {
        return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
      }
      return syntaxHighlight;
    });

configureIcons.$inject = ['$mdIconProvider'];

function configureIcons($mdIconProvider){
  $mdIconProvider
    .defaultIconSet('img/icons/sets/core-icons.svg', 24);
}

