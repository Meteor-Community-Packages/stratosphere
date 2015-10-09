angular
  .module('stratosphere')
  .controller("IndexCtrl", IndexCtrl);

IndexCtrl.$inject = ['$scope','$stateParams','$meteor'];

function IndexCtrl($scope,$stateParams,$meteor) {

  this.settings = {
    printLayout: true,
    showRuler: true,
    showSpellingSuggestions: true,
    presentationMode: 'edit'
  };

};
