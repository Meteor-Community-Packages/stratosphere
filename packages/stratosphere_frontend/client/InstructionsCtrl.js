angular
  .module('stratosphere')
  .controller('InstructionsCtrl', InstructionsCtrl);

InstructionsCtrl.$inject = ['$mdDialog'];

function InstructionsCtrl($mdDialog) {

  //adapted from meteor tool
  var url = Meteor.settings.public.url;
  url = url.replace(/^\https:\/\//, '');
  url = url.replace(/^\http:\/\//, '');
  url = url.replace(/\/+$/, '');
  url = url.replace(/[^a-zA-Z0-9.-]/g, 'X');

  this.dbName = `${url}.data.db`;

  this.cancel = () => {
    $mdDialog.hide();
  }
};