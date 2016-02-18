angular
  .module('stratosphere')
  .controller("IndexCtrl", IndexCtrl);


IndexCtrl.$inject = ['$scope','$rootScope','$state','$reactive','$mdDialog'];

function IndexCtrl($scope,$rootScope,$state,$reactive,$mdDialog) {
  $reactive(this).attach($scope);


  this.loginRequired = Meteor.settings.public.loginRequired;

  this.MDsettings = {
    printLayout: true,
    showRuler: true,
    showSpellingSuggestions: true,
    presentationMode: 'edit'
  };

  this.logout = Meteor.logout;
  this.login = () => {
    //$state.go('login');
    Meteor.loginWithMeteorDeveloperAccount((err) => {
      if (err) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(`Login error - ${err.msg}`)
        );
        $state.go('forbidden');
      } else {
        //$history.previous();
      }
    });
  }

  this.showInstructions = $event => {
    $mdDialog.show({
      templateUrl: 'stratosphere_frontend_client/instructions.ng.html',
      targetEvent:$event,
      controller:'InstructionsCtrl',
      controllerAs:'vm',
      clickOutsideToClose:true,
      disableParentScroll:true
    });
  };

};
