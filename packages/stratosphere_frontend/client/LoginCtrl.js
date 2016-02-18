
angular
    .module('stratosphere')
    .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$state','$mdToast','$history'];

function LoginCtrl($state,$mdToast,$history) {
    this.triggerLogin = function(){
        try{
            Meteor.loginWithMeteorDeveloperAccount((err) => {
                if(err){
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent(`Login error - ${err.msg}`)
                    );
                    $state.go('forbidden');
                }else{
                    $history.previous();
                }
            });
        }catch(e){
            if(e.attemptedUrl){
                alert("Login required, but login popup blocked by browser.");
            }
        }
    }
};