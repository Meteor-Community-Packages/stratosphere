angular
  .module('stratosphere.details')
  .controller("stVersionCtrl", stVersionCtrl);

stVersionCtrl.$inject = ['$scope','$types','$meteor','$mdDialog','$mdToast'];

function stVersionCtrl($scope,$types,$meteor,$mdDialog,$mdToast) {
  var self = this;

  //properties
  self.$scope = $scope;

  //methods
  self.unpublish = unpublish;
  self.cancel = cancel;

  //activate
  activate();

  function activate(){
    $scope.$meteorSubscribe(self.type.subscribeVersion,self.version._id);
  }

  function cancel(){
    $mdDialog.cancel();
  }

  function unpublish(ev){
    $mdDialog.show(
      $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Are you sure?')
        .content(`Unpublishing will remove this ${self.type.versionLabel}?`)
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
    )
        .then(function() {
          $meteor.call(self.type.unpublishVersion,self.version._id)
              .then(function(){
                $mdToast.show($mdToast.simple().content(`Successfully unpublished ${self.type.versionLabel}`));
                self.cancel();
              },function(err){
                $mdToast.show($mdToast.simple().content(`Error while unpublishing ${self.type.versionLabel}: ${err.msg}`).theme('warn'));
              });
        });
  }

};