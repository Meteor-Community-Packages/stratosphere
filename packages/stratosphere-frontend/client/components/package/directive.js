angular
  .module('stratosphere.components.package')
  .directive("stPackage", stPackage);

stPackage.$inject = [];
function stPackage() {
  return {
    restrict: "EA",
    scope:{},
    bindToController:{
      package : '='
    },
    controller:'stPackageCtrl',
    controllerAs:'packageVM',
    templateUrl: "stratosphere-frontend_client/components/package/item.ng.html"
  }
};
