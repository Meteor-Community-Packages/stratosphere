angular
  .module('stratosphere.package')
  .controller("stPackageCtrl", stPackageCtrl);

stPackageCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stPackageCtrl($scope,$stateParams,$meteor) {
  var self = this;

  //properties
  self.$scope = $scope;


  //activate
  activate();

  function activate(){

  }


};