angular
  .module('stratosphere.list')
  .controller("stListCtrl", stListCtrl);

stListCtrl.$inject = ['$scope','$types','$stateParams','$meteor'];

function stListCtrl($scope,$types,$stateParams,$meteor) {
  var self = this;

  //properties
  self.$scope = $scope;
  self.sortBy = sortBy;

  $scope.page = 1;
  $scope.perPage = 10;
  $scope.sort = {};
  $scope.sort[($stateParams.sort || 'name')] = 1;

  self.type = $types[$stateParams.type];

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe(self.type.subscribeList,{});
    self.items = $scope.$meteorCollection(function() {
      return self.type.collection.find({}, {
        sort : $scope.getReactively('sort')
      });
    },false);

    self.nbItems = $scope.$meteorObject(Counts ,self.type.count, false);

    $meteor.autorun($scope, function() {
      $scope.$meteorSubscribe(self.type.subscribeList, {
        limit: parseInt($scope.getReactively('perPage')),
        skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
        sort: $scope.getReactively('sort')
      });
    });
  }

  function sortBy(key){
    var sort = {};
    if(key==='name'){
      sort[key] = 1;
    }else{
      sort[key] = -1;
    }

    $scope.sortBy = sort;
  }


};
