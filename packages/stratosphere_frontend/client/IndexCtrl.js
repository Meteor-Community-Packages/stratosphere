angular
  .module('stratosphere')
    .controller("IndexCtrl", IndexCtrl);


IndexCtrl.$inject = ['$scope','$mdDialog'];

function IndexCtrl($scope,$mdDialog) {

  var self = this;
  self.$scope = $scope;

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
