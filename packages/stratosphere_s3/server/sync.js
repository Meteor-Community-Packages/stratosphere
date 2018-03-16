Stratosphere = (typeof Stratosphere=== 'undefined') ? { } : Stratosphere;
Stratosphere.utils = (typeof Stratosphere.utils=== 'undefined') ? { } : Stratosphere.utils;

import S3Client from 'aeris-s3-sync';

const s3Client = S3Client({
	accessKeyId: Meteor.settings.s3Sync.accessKey,
	secretAccessKey: Meteor.settings.s3Sync.secretKey,
	region: Meteor.settings.s3Sync.region
});

Stratosphere.utils.syncFromS3 = function () {
	s3Client.sync('s3://' + Meteor.settings.s3Sync.bucket, Meteor.settings.directories.uploads, {
		delete: false
	})
	.then(res => {
		if (res && res.files) {
			console.log('Synced files from S3: ' + ((res.files.length && res.files) || 'n/a'));
		}
	})
};

Stratosphere.utils.syncToS3 = function (callback) {
	s3Client.sync(Meteor.settings.directories.uploads, 's3://' + Meteor.settings.s3Sync.bucket, {
		delete: false
	})
	.then(res => {
		if (res && res.files) {
			console.log('Synced files to S3: ' + ((res.files.length && res.files) || 'n/a'));
		}

		if (callback) {
			callback();
		}
	})
};
