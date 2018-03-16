Meteor.startup(function () {
	console.log('Enable explicit whitelisting');
	Stratosphere.whitelisting.start();

	console.log('Start auth server');
	Stratosphere.authServer.start();
});