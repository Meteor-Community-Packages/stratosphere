angular
    .module('stratosphere.users')
    .controller("stUsersCtrl", stUsersCtrl);

stUsersCtrl.$inject = ['$scope','$stateParams','$meteor'];

function stUsersCtrl($scope,$stateParams,$meteor) {
    var self = this;

    //properties
    self.$scope = $scope;
    self.addUser = addUser;
    self.removeUser = removeUser;

    //activate
    activate();

    function activate(){
        $scope.$meteorSubscribe('stratosphere/users');
        self.users = $scope.$meteorCollection(Meteor.users,false);
    }

    function addUser(key){

    }

    function removeUser(key){

    }


};
