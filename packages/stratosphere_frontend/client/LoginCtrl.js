
angular
    .module('stratosphere')
    .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope','$state','$mdToast','$history'];

function LoginCtrl($scope,$state,$mdToast,$history) {
    var self = this;
    self.$scope = $scope;

    self.triggerLogin = function(){
        try{
            $meteor.loginWithMeteorDeveloperAccount().then(function(){
               $history.previous();
            }, function(err){
                console.log('Login error - ', err.msg);
                $mdToast.show(
                    $mdToast.simple()
                        .content("Login error: "+err.msg)
                );
                $state.go('forbidden');
            });
        }catch(e){
            if(e.attemptedUrl){
                alert("Login required, but login popup blocked by browser.");
            }
        }
    }
};