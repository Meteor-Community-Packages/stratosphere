angular
    .module('stratosphere.users')
    .controller("stPermissionsCtrl", stPermissionsCtrl);

stPermissionsCtrl.$inject = ['$scope','$meteor','$mdDialog'];

function stPermissionsCtrl($scope,$meteor,$mdDialog) {
    var self = this;

    //properties
    self.$scope = $scope;

    self.permissions = ['canPublish','canUnpublish'];
    self.cancel = cancel;
    self.setPermission = setPermission;

    //activate
    activate();

    function activate(){
        //self.user = $scope.$meteorObject(Meteor.users,self.user._id,true);
    }

    function setPermission(permission){
        $meteor.call('/stratosphere/setUserPermission',self.user._id,permission,self.user.permissions[permission]);
    }

    function cancel(){
        $mdDialog.cancel();
    }

};
