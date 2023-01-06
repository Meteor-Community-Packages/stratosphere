Stratosphere = (typeof Stratosphere=== 'undefined') ? { } : Stratosphere;
Stratosphere.utils = (typeof Stratosphere.utils=== 'undefined') ? { } : Stratosphere.utils;

Stratosphere.utils.isS3SyncEnabled = function () {
	return !!(Meteor.settings && Meteor.settings.enableS3Sync);
};