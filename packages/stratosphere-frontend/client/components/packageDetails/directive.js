angular
  .module('stratosphere.components.packageDetails')
  .directive("stPackageDetails", stPackageDetails);

stPackageDetails.$inject = [];
function stPackageDetails() {
  return {
    restrict: "EA",
    scope:{},
    bindToController:{
      packageId : '@'
    },
    controller:'stPackageDetailsCtrl',
    controllerAs:'vm',
    templateUrl: "stratosphere-frontend_client/components/packageDetails/details.ng.html"
  }
};
