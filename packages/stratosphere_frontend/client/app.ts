import {Component, View, NgFor, bootstrap} from 'angular2/angular2';
import {ReleaseForm} from 'client/release-form/release-form';

@Component({
    selector: 'stratosphere'
})
@View({
    templateUrl: 'client/stratosphere.ng.html',
    directives: [NgFor,ReleaseForm]
})
class StratosphereApp {
    constructor () {
        Tracker.autorun(zone.bind(() => {
            this.packages = Packages.find().fetch();
        }));

    }
}

bootstrap(StratosphereApp);
