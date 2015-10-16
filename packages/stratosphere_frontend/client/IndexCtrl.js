angular
  .module('stratosphere')
    .controller("IndexCtrl", IndexCtrl);


IndexCtrl.$inject = ['$scope','$rootScope','$meteor','$mdDialog'];

function IndexCtrl($scope,$rootScope,$meteor,$mdDialog) {

  var self = this;
  self.$scope = $scope;

  console.log($rootScope.currentUser);

  self.loginRequired = Meteor.settings.public.loginRequired;
  self.logout = $meteor.logout;

  self.settings = {
    printLayout: true,
    showRuler: true,
    showSpellingSuggestions: true,
    presentationMode: 'edit'
  };

  self.showInstructions = showInstructions;

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
