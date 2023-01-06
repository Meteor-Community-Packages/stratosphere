Meteor.startup(function () {
	if (Stratosphere.utils.isWhitelistingEnabled()) {
		console.log('Enable explicit whitelisting');
		Stratosphere.whitelisting.start();

		console.log('Start auth server');
		Stratosphere.authServer.start();
	}
	else {
		console.log('IP-whitelisting is disabled');
	}
});