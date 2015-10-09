angular
  .module('stratosphere.packages')
  .controller("stPackagesCtrl", stPackagesCtrl);

stPackagesCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stPackagesCtrl($scope,$stateParams,$meteor) {
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
    $scope.$meteorSubscribe('stratosphere/packages',{});
    self.packages = $scope.$meteorCollection(function() {
      return Packages.find({}, {
        sort : $scope.getReactively('sort')
      });
    },false);

    self.nbPackages = $scope.$meteorObject(Counts ,'nbPackages', false);

    $meteor.autorun($scope, function() {
      $scope.$meteorSubscribe('stratosphere/packages', {
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
