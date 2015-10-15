angular
  .module('stratosphere')
  .controller('InstructionsCtrl', InstructionsCtrl);

InstructionsCtrl.$inject = ['$scope','$mdDialog'];

function InstructionsCtrl($scope,$mdDialog) {
  var self = this;
  self.$scope = $scope;

  //adapted from meteor tool
  var url = Meteor.settings.public.url;
  url = url.replace(/^\https:\/\//, '');
  url = url.replace(/^\http:\/\//, '');
  url = url.replace(/\/+$/, '');
  url = url.replace(/[^a-zA-Z0-9.-]/g, 'X');

  self.dbName = url+'.data.db';

  self.cancel = function(){
    $mdDialog.hide();
  }
};