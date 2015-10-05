import {Component, View} from 'angular2/angular2';
import {FORM_DIRECTIVES, Control, ControlGroup, Validators} from 'angular2/angular2';

@Component({
    selector: 'parties-form'
})
@View({
    templateUrl: 'client/release-form/release-form.ng.html',
    directives: [FORM_DIRECTIVES]
})
export class ReleaseForm {
    constructor() {
        this.releaseForm = new ControlGroup({
            name: new Control('', Validators.required),
            description: new Control('', Validators.required)
        });
    }
}