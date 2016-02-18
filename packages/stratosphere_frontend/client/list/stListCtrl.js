angular
  .module('stratosphere.list')
  .controller("stListCtrl", stListCtrl);

stListCtrl.$inject = ['$scope','$types','$stateParams','$reactive'];

function stListCtrl($scope,$types,$stateParams,$reactive) {
  $reactive(this).attach($scope);

  //properties



  this.page = 1;
  this.perPage = 10;
  this.sort = {};
  this.sort[($stateParams.sort || 'name')] = 1;

  this.type = $types[$stateParams.type];

  this.helpers({
    items : () => this.type.collection.find({}, {sort : this.getReactively('sort')}),
  });

  this.nbItems = Counts.findOne(this.type.count);

  this.sortBy = key => {
    var sort = {};
    if(key==='name'){
      sort[key] = 1;
    }else{
      sort[key] = -1;
    }

    this.sortBy = sort;
  };

  //activate

  const activate = () => {
    this.subscribe(this.type.subscribeList,() => [{
      limit: parseInt(this.getReactively('perPage')),
      skip: (parseInt(this.getReactively('page')) - 1) * parseInt(this.getReactively('perPage')),
      sort: this.getReactively('sort')
    }]);
  }
  activate();


};
