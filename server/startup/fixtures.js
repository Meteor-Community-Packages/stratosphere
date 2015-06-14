Meteor.startup(function () {
    console.log('Import fixtures if needed');

    console.log('-Import metadata');
    var syncToken = Metadata.findOne({key: 'syncToken'});
    if (!syncToken) {
        syncToken = {
            format: "1.1"
        }
        Metadata.insert({key: 'syncToken', value: syncToken});
    }

    var lastDeletion = Metadata.findOne({key: 'lastDeletion'});
    if (!lastDeletion) {
        Metadata.insert({key: 'lastDeletion', value: 0});
    }

    console.log('-Configure meteor developer accounts service');
    if (Meteor.settings.meteorDeveloperAccount) {
        ServiceConfiguration.configurations.upsert({
            service: "meteor-developer"
        }, {
            $set: {
                clientId: Meteor.settings.meteorDeveloperAccount.clientId,
                secret: Meteor.settings.meteorDeveloperAccount.secret,
                service: "meteor-developer"
            }
        });
    }
});