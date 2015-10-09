var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var angular2_1 = require('angular2/angular2');
var release_form_1 = require('packages/stratosphere_frontend/client/release-form/release-form');
var StratosphereApp = (function () {
    function StratosphereApp() {
        var _this = this;
        Tracker.autorun(zone.bind(function () {
            _this.packages = Packages.find().fetch();
        }));
    }
    StratosphereApp = __decorate([
        angular2_1.Component({
            selector: 'stratosphere'
        }),
        angular2_1.View({
            templateUrl: 'packages/stratosphere_frontend/client/stratosphere.ng.html',
            directives: [angular2_1.NgFor, release_form_1.ReleaseForm]
        })
    ], StratosphereApp);
    return StratosphereApp;
})();
angular2_1.bootstrap(StratosphereApp);
//# sourceMappingURL=app.js.map