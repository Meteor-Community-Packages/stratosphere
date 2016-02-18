angular
  .module('stratosphere.details')
  .controller("stVersionCtrl", stVersionCtrl);

stVersionCtrl.$inject = ['$scope','$types','$reactive','$mdDialog','$mdToast'];

function stVersionCtrl($scope,$types,$reactive,$mdDialog,$mdToast) {
  $reactive(this).attach($scope);

  //methods
  this.unpublish = (ev) => {
    $mdDialog.show(
      $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Are you sure?')
        .content(`Unpublishing will remove this ${this.type.versionLabel}?`)
        .ariaLabel('Confirm unpublish')
        .cancel('Cancel')
        .ok('Yes, delete!')
        .targetEvent(ev)
      )
      .then(() => {
        this.call(this.type.unpublishVersion,this.version._id,err => {
          if(err){
            $mdToast.show($mdToast.simple().content(`Error while unpublishing ${this.type.versionLabel}: ${err.msg}`).theme('warn'));
          }else{
            $mdToast.show($mdToast.simple().content(`Successfully unpublished ${this.type.versionLabel}`));
            this.cancel();
          }
        });
      });
  };
  this.cancel = () => {
    $mdDialog.cancel();
  }

  //activate
  const activate = () => {
    this.subscribe(this.type.subscribeVersion,this.version._id);
  }
  activate();


};