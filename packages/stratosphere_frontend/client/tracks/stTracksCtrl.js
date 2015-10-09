angular
  .module('stratosphere.tracks')
  .controller("stTracksCtrl", stTracksCtrl);

stTracksCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stTracksCtrl($scope,$stateParams,$meteor) {
  var self = this;

  //properties
  self.$scope = $scope;
  self.sortBy = sortBy;

  $scope.page = 1;
  $scope.perPage = 10;
  $scope.sort = {};
  $scope.sort[($stateParams.sort || 'name')] = 1;

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe('stratosphere/tracks',{});
    self.tracks = $scope.$meteorCollection(function() {
      return ReleaseTracks.find({}, {
        sort : $scope.getReactively('sort')
      });
    },false);

    $meteor.autorun($scope, function() {
      $scope.$meteorSubscribe('stratosphere/tracks', {
        limit: parseInt($scope.getReactively('perPage')),
        skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
        sort: $scope.getReactively('sort')
      });
    });
  }

  function sortBy(key){
    var sort = {};
    sort[key] = 1;
    $scope.sortBy = sort;
  }


};
