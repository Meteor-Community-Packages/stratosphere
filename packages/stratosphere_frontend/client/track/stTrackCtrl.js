angular
  .module('stratosphere.track')
  .controller("stTrackCtrl", stTrackCtrl);

stTrackCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stTrackCtrl($scope,$stateParams,$meteor) {
  var self = this;

  //properties
  self.$scope = $scope;


  //activate
  activate();

  function activate(){

  }


};
