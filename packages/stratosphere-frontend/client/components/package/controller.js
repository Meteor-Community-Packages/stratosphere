angular
  .module('stratosphere.components.package')
  .controller('stPackageCtrl', stPackageCtrl);

stPackageCtrl.$inject = [
  '$scope',
  '$meteor',
  '$mdDialog'
];

function stPackageCtrl($scope, $meteor, $mdDialog) {
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
        .content('Are you sure you want to unpublish (remove) this package and all related versions and builds?')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function() {
        $meteor.call('unpublishPackage',self.package._id);
      });

  }
}
