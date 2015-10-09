angular
  .module('stratosphere.packages')
  .controller("stPackagesCtrl", stPackagesCtrl);

stPackagesCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stPackagesCtrl($scope,$stateParams,$meteor) {
  var self = this;

  //properties
  self.$scope = $scope;


  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe('stratosphere/releaseTracks');
    self.tracks = $scope.$meteorCollection(function() {
      return ReleaseTracks.find({}, {sort: {"name": 1}});
    },false);
  }


};
