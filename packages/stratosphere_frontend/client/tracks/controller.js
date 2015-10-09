angular
  .module('stratosphere.tracks')
  .controller("stTracksCtrl", stTracksCtrl);

stTracksCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stTracksCtrl($scope,$stateParams,$meteor) {
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
