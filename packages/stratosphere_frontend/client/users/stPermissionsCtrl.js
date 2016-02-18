angular
    .module('stratosphere.users')
    .controller("stPermissionsCtrl", stPermissionsCtrl);

stPermissionsCtrl.$inject = ['$scope','$reactive','$mdDialog'];

function stPermissionsCtrl($scope,$reactive,$mdDialog) {
    $reactive(this).attach($scope);

    //properties
    this.permissions = ['canPublish','canUnpublish'];
    
    this.cancel = () => {
        $mdDialog.cancel();
    };
    
    this.setPermission = permission => {
        this.call('/stratosphere/setUserPermission',this.user._id,permission,this.user.permissions[permission]);
    };

    //activate
    const activate = () => {}
    activate();
};
