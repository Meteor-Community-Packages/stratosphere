var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var angular2_1 = require('angular2/angular2');
var angular2_2 = require('angular2/angular2');
var ReleaseForm = (function () {
    function ReleaseForm() {
        this.releaseForm = new angular2_2.ControlGroup({
            name: new angular2_2.Control('', angular2_2.Validators.required),
            description: new angular2_2.Control('', angular2_2.Validators.required)
        });
    }
    ReleaseForm = __decorate([
        angular2_1.Component({
            selector: 'parties-form'
        }),
        angular2_1.View({
            templateUrl: 'client/release-form/release-form.ng.html',
            directives: [angular2_2.FORM_DIRECTIVES]
        })
    ], ReleaseForm);
    return ReleaseForm;
})();
exports.ReleaseForm = ReleaseForm;
//# sourceMappingURL=release-form.js.map