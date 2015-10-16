angular
    .module('stratosphere.users')
    .controller("stUsersCtrl", stUsersCtrl);

stUsersCtrl.$inject = ['$scope','$stateParams','$meteor','$mdToast','$mdDialog'];

function stUsersCtrl($scope,$stateParams,$meteor,$mdToast,$mdDialog) {
    var self = this;

    //properties
    self.$scope = $scope;
    self.viewMode = 'chips';
    self.viewModes = ['chips','list'];
    self.permissions = ['canPublish','canUnpublish'];
    self.loginRequired = Meteor.settings.public.loginRequired;

    self.addUser = addUser;
    self.removeUser = removeUser;
    self.showPermissionsDialog = showPermissionsDialog;
    self.setPermission = setPermission;

    //activate
    activate();

    function activate(){
        $scope.$meteorSubscribe('/stratosphere/users',{});
        self.users = $scope.$meteorCollection(function(){
            return Meteor.users.find({"permissions.superUser":{$ne:true}},{sort:{name:1}})
        },false);

        self.superUsers = $scope.$meteorCollection(function(){
            return Meteor.users.find({"permissions.superUser":true},{sort:{name:1}})
        },false);
    }

    function showPermissionsDialog($event,user){
        $mdDialog.show({
            templateUrl: 'stratosphere_frontend_client/users/permissions.ng.html',
            targetEvent:$event,
            controller:'stPermissionsCtrl',
            controllerAs:'vm',
            locals:{
                user:user
            },
            bindToController:true,
            clickOutsideToClose:true,
            disableParentScroll:true
        });
    }

    function setPermission(user,permission){
        $meteor.call('/stratosphere/setUserPermission',user._id,permission,user.permissions[permission]);
    }

    function addUser(name){

        return $meteor.call('/stratosphere/addUser',name).then(function(user){
            return user;
        },function(err){
            $mdToast.show(
                $mdToast.simple()
                    .content("Error while adding user: "+err.message)
            );
        });
    }

    function removeUser(user){
        $meteor.call('/stratosphere/removeUser',user._id).then(function(){},function(err){
            $mdToast.show(
                $mdToast.simple()
                    .content("Error while removing user: "+err.message)
            );
        });
    }


};
