angular
  .module('stratosphere.components.version')
  .directive("stVersion", stVersion);

stVersion.$inject = [];
function stVersion() {
  return {
    restrict: "EA",
    scope:{},
    bindToController:{
      version: '='
    },
    controller:'stVersionCtrl',
    controllerAs:'versionVM',
    templateUrl: "stratosphere-frontend_client/components/version/item.ng.html"
  }
};
