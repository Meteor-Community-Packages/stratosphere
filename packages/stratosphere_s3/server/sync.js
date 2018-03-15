Stratosphere = (typeof Stratosphere=== 'undefined') ? { } : Stratosphere;
Stratosphere.utils = (typeof Stratosphere.utils=== 'undefined') ? { } : Stratosphere.utils;

import S3ClientImport from 'aeris-s3-sync';
const S3Client = require('S3ClientImport');

const s3Client = S3Client({
	accessKeyId: Meteor.settings.s3Sync.accessKey,
	secretAccessKey: Meteor.settings.s3Sync.secretKey,
	region: Meteor.settings.s3Sync.region
});

Stratosphere.utils.syncFromS3 = function () {
	s3Client.sync('s3://' + Meteor.settings.s3Sync.bucket, Meteor.settings.directories.uploads, {
		delete: true,
		stdout: process.stdout
	})
	.then(res => {
		if (res && res.files) {
			console.log('Synced files from S3: ' + res.files);
		}
	})
};

Stratosphere.utils.syncToS3 = function () {
	s3Client.sync(Meteor.settings.directories.uploads, 's3://' + Meteor.settings.s3Sync.bucket, {
		delete: false,
		stdout: process.stdout
	})
	.then(res => {
		if (res && res.files) {
			console.log('Synced files to S3: ' + res.files);
		}
	})
};
