angular
  .module('stratosphere.details')
  .controller("stDetailsCtrl", stDetailsCtrl);

stDetailsCtrl.$inject = ['$scope','$types','$state','$stateParams','$reactive','$mdDialog','$mdMedia','$mdToast'];

function stDetailsCtrl($scope,$types,$state,$stateParams,$reactive,$mdDialog,$mdMedia,$mdToast) {
  $reactive(this).attach($scope);

  //properties
  this.name = $stateParams.name;
  this.loadingVersions = false;
  this.allVersionsLoaded = false;
  this.showReadme = $mdMedia('gt-sm');

  this.type = $types[$stateParams.type];

  var selector = {};
  selector[this.type.linkedBy] = this.name;
  this.helpers({
    versions: () => this.type.versionsCollection.find(selector, {sort : {versionMagnitude : -1}})
  });

  //methods
  this.loadVersions = () => {
    this.loadingVersions = true;
    this.subscribe(this.type.subscribeVersions,this.name,(err) => {
      this.loadingVersions = false;
    });
  };

  this.versionDetails = ($event,version) => {
    console.log(version);
    $mdDialog.show({
      templateUrl: 'stratosphere_frontend_client/details/version.ng.html',
      targetEvent:$event,
      controller:'stVersionCtrl',
      controllerAs:'vm',
      locals:{
        type:this.type,
        version:version
      },
      bindToController:true,
      clickOutsideToClose:true,
      disableParentScroll:true
    });
  };
  this.unpublish = ev => {
    $mdDialog.show(
      $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Are you sure?')
        .content(`Unpublishing will permamently delete this ${this.type.label} and all related versions.`)
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
      )
      .then(() => {
        this.call(this.type.unpublish,this.item._id,(err) => {
          if(err){
            $mdToast.show($mdToast.simple().content(`Error while unpublishing ${this.type.label}: ${err.msg}`).theme('warn'));
          }else{
            $mdToast.show($mdToast.simple().content(`Successfully unpublished ${this.type.label}`));
            $state.go('list',{type:$stateParams.type});
          }
        });
      });
  };

  //activate

  const activate = () => {
    this.subscribe(this.type.subscribeDetails,this.name);

    this.item = this.type.collection.findOne({name:this.name});

    this.nbVersions = Counts.findOne(this.type.versionsCount);
  }
  activate();


  $scope.$on('$destroy', () => {
    this.type = null;
  });


};