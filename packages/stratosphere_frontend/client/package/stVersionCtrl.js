angular
  .module('stratosphere.package')
  .controller("stVersionCtrl", stVersionCtrl);

stVersionCtrl.$inject = ['$scope','$meteor','$mdDialog'];

function stVersionCtrl($scope,$meteor,$mdDialog) {
  var self = this;

  //properties
  self.$scope = $scope;

  //methods
  self.unpublish = unpublish;
  self.cancel = cancel;

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe('stratosphere/version',self.version._id);
    //self.version = $scope.$meteorObject(Versions,self.version._id,false);
  }

  function cancel(){
    $mdDialog.cancel();
  }

  function unpublish(ev){
    $mdDialog.show(
      $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Are you sure?')
        .content('Unpublishing will remove this version and all related builds.')
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
    ).then(function() {
        $meteor.call('unPublishVersion',self.version._id)
      });
  }

};