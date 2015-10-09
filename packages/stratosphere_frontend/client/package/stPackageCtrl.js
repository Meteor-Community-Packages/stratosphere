angular
  .module('stratosphere.package')
  .controller("stPackageCtrl", stPackageCtrl);

stPackageCtrl.$inject = ['$scope','$stateParams','$meteor','$mdDialog'];

function stPackageCtrl($scope,$stateParams,$meteor,$mdDialog) {
  var self = this;

  //properties
  self.$scope = $scope;
  self.name = $stateParams.name;
  self.loadingVersions = false;
  self.allVersionsLoaded = false;

  //methods
  self.loadVersions = loadVersions;
  self.versionDetails = versionDetails;
  self.unpublish = unpublish;

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe('stratosphere/package',self.name);

    self.package = $scope.$meteorObject(Packages,{name:self.name},false);

    self.versions = $scope.$meteorCollection(function() {
      return Versions.find({packageName:self.name}, {
        sort : {versionMagnitude : -1}
      });
    },false);

    self.nbVersions = $scope.$meteorObject(Counts ,'nbVersions', false);
  }

  function loadVersions(){
    self.loadingVersions = true;
    $scope.$meteorSubscribe('stratosphere/versions',self.name).then(function(){
      self.loadingVersions = false;
    },function(){
      self.loadingVersions = false;
    });
  }

  function unpublish(ev){
    $mdDialog.show(
      $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Are you sure?')
        .content('Unpublishing will remove this package and all related versions and builds.')
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
      ).then(function() {
        $meteor.call('unPublishPackage',self.package._id)
      });
  }

  function versionDetails($event,version){
    console.log(version);
    $mdDialog.show({
      templateUrl: 'stratosphere_frontend_client/package/version.ng.html',
      targetEvent:$event,
      controller:'stVersionCtrl',
      controllerAs:'vm',
      locals:{
        version:version
      },
      bindToController:true,
      clickOutsideToClose:true,
      disableParentScroll:true
    });
  }


};