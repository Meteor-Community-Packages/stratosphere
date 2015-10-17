angular
  .module('stratosphere')
    .controller("IndexCtrl", IndexCtrl);


IndexCtrl.$inject = ['$scope','$rootScope','$state','$meteor','$mdDialog'];

function IndexCtrl($scope,$rootScope,$state,$meteor,$mdDialog) {

  var self = this;
  self.$scope = $scope;

  console.log($rootScope.currentUser);

  self.loginRequired = Meteor.settings.public.loginRequired;
  self.logout = $meteor.logout;
  self.login = login;

  self.settings = {
    printLayout: true,
    showRuler: true,
    showSpellingSuggestions: true,
    presentationMode: 'edit'
  };

  self.showInstructions = showInstructions;

  function login(){
    //$state.go('login');
    $meteor.loginWithMeteorDeveloperAccount().then(function(){
      // $history.previous();
    }, function(err){
      console.log('Login error - ', err.msg);
      $mdToast.show(
          $mdToast.simple()
              .content("Login error: "+err.msg)
      );
      $state.go('forbidden');
    });
  }

  function showInstructions($event){
    $mdDialog.show({
      templateUrl: 'stratosphere_frontend_client/instructions.ng.html',
      targetEvent:$event,
      controller:'InstructionsCtrl',
      controllerAs:'vm',
      clickOutsideToClose:true,
      disableParentScroll:true
    });
  }

};
