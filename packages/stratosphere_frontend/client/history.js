angular.module('stratosphere')
    .service("$history", historyService)
    .run(addToHistory);

historyService.$inject = ["$state", "$rootScope", "$window"];
function historyService($state, $rootScope, $window) {
    var history = [];
    angular.extend(this, {
        push: function(state, params) {
            history.push({ state: state, params: params });
        },
        all: function() {
            return history;
        },
        go: function(step) {
            var prev = this.previous(step || -1);
            return $state.go(prev.state, prev.params);
        },
        previous: function(step) {
            return history[history.length - Math.abs(step || 1)];
        },
        back: function() {
            return this.go(-1);
        }
    });
}

addToHistory.$inject = ["$history", "$state", "$rootScope"];
function addToHistory($history, $state, $rootScope) {

    $rootScope.$on("$stateChangeSuccess", function(event, to, toParams, from, fromParams) {
        if (!from.abstract) {
            $history.push(from, fromParams);
        }
    });

    $history.push($state.current, $state.params);
};