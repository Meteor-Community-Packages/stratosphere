angular
  .module('stratosphere.components.version')
  .controller('stVersionCtrl', stVersionCtrl);

stVersionCtrl.$inject = [
  '$scope',
  '$meteor',
  '$mdDialog'
];

function stVersionCtrl($scope, $meteor, $mdDialog) {
  var self = this;

//properties
  self.$scope = $scope;

//methods
  self.unpublish = unpublish;

  activate();
  function activate(){}

  function unpublish(ev){
// Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
      .title('Confirm removal')
      .content('Are you sure you want to unpublish (remove) this version and all related builds?')
      .targetEvent(ev)
      .ok('Yes')
      .cancel('No');
    $mdDialog.show(confirm).then(function() {
      $meteor.call('unpublishVersion',self.version._id);
    });

  }
}
