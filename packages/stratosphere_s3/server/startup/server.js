Meteor.startup(function () {
	if (Stratosphere.utils.isS3SyncEnabled()) {
		console.log('Start builds observer');
		Stratosphere.observer.start();

		console.log('Sync S3 to and from local uploads folder');
		Stratosphere.utils.syncFromS3();
	}
	else {
		console.log('Sync via S3 is disabled');
	}
});
