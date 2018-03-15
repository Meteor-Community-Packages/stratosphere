Meteor.startup(function () {
	console.log('Start builds observer');
	Stratosphere.observer.start();

	console.log('Sync S3 to local uploads folder');
	Stratosphere.utils.syncFromS3();
});
