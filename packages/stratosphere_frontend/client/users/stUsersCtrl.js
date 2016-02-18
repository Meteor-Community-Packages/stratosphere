angular
    .module('stratosphere.users')
    .controller("stUsersCtrl", stUsersCtrl);

stUsersCtrl.$inject = ['$scope','$stateParams','$reactive','$mdToast','$mdDialog'];

function stUsersCtrl($scope,$stateParams,$reactive,$mdToast,$mdDialog) {
    $reactive(this).attach($scope);

    //properties
    this.viewMode = 'chips';
    this.viewModes = ['chips','list'];
    this.permissions = ['canPublish','canUnpublish'];
    this.loginRequired = Meteor.settings.public.loginRequired;

    this.helpers({
        users : () => Meteor.users.find({"permissions.superUser":{$ne:true}},{sort:{name:1}}),
        superUsers : () => Meteor.users.find({"permissions.superUser":true},{sort:{name:1}})
    });

    this.addUser = name => {
        return this.call('/stratosphere/addUser',name,(err,user) => {
              if(err){
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent(`Error while adding user: ${err.message}`)
                  );
              }else{
                  return user;
              }
          });
    };

    this.removeUser = user => {
        this.call('/stratosphere/removeUser',user._id).then(()=>{},err => {
            $mdToast.show(
              $mdToast.simple()
                .textContent(`Error while removing user: ${err.message}`)
            );
        });
    };

    this.showPermissionsDialog = ($event,user) => {
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
    };

    this.setPermission = (user,permission) => {
        this.call('/stratosphere/setUserPermission',user._id,permission,user.permissions[permission]);
    };

    //activate
    const activate = () => {
        this.subscribe('/stratosphere/users',{});
    }
    activate();

};
