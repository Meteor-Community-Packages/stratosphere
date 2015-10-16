angular
  .module('stratosphere.details')
  .controller("stDetailsCtrl", stDetailsCtrl);

stDetailsCtrl.$inject = ['$scope','$types','$state','$stateParams','$meteor','$mdDialog','$mdMedia','$mdToast'];

function stDetailsCtrl($scope,$types,$state,$stateParams,$meteor,$mdDialog,$mdMedia,$mdToast) {
  var self = this;

  //properties
  self.$scope = $scope;
  self.name = $stateParams.name;
  self.loadingVersions = false;
  self.allVersionsLoaded = false;
  self.showReadme = $mdMedia('gt-sm');

  //methods
  self.loadVersions = loadVersions;
  self.versionDetails = versionDetails;
  self.unpublish = unpublish;

  self.type = $types[$stateParams.type];

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe(self.type.subscribeDetails,self.name);

    self.item = $scope.$meteorObject(self.type.collection,{name:self.name},false);

    self.versions = $scope.$meteorCollection(function() {
      var selector = {};
      selector[self.type.linkedBy] = self.name;
      return self.type.versionsCollection.find(selector, {
        sort : {versionMagnitude : -1}
      });
    },false);

    self.nbVersions = $scope.$meteorObject(Counts, self.type.versionsCount, false);
  }

  function loadVersions(){
    self.loadingVersions = true;
    $scope.$meteorSubscribe(self.type.subscribeVersions,self.name).then(function(){
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
        .content(`Unpublishing will permamently delete this ${self.type.label} and all related versions.`)
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
      )
        .then(function() {
          $meteor.call(self.type.unpublish,self.item._id)
              .then(function(){
                $mdToast.show($mdToast.simple().content(`Successfully unpublished ${self.type.label}`));
                $state.go('list',{type:$stateParams.type});
              },function(err){
                $mdToast.show($mdToast.simple().content(`Error while unpublishing ${self.type.label}: ${err.msg}`).theme('warn'));
              });
        });

  }

  function versionDetails($event,version){
    console.log(version);
    $mdDialog.show({
      templateUrl: 'stratosphere_frontend_client/details/version.ng.html',
      targetEvent:$event,
      controller:'stVersionCtrl',
      controllerAs:'vm',
      locals:{
        type:self.type,
        version:version
      },
      bindToController:true,
      clickOutsideToClose:true,
      disableParentScroll:true
    });
  }

  $scope.$on('$destroy', function() {
    self.type = null;
  });


};