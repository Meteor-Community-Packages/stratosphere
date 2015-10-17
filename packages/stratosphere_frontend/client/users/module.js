angular
    .module("stratosphere.users",['stratosphere.dependencies'])
    .config(configureRoutes);


configureRoutes.$inject = ['$stateProvider', '$locationProvider'];
function configureRoutes($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('users', {
            url: "/users",
            templateUrl: 'stratosphere_frontend_client/users/users.ng.html',
            controller: 'stUsersCtrl',
            controllerAs: 'vm',
            resolve: {
                "currentUser": ["$meteor", function($meteor){
                    return $meteor.requireValidUser(function(user) {
                        if (Meteor.settings.public.loginRequired && user.permissions.superUser) {
                            return true;
                        }

                        return 'FORBIDDEN';
                    });
                }]
            }
        });
}