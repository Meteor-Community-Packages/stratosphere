Stratosphere = (typeof Stratosphere=== 'undefined') ? { } : Stratosphere;
Stratosphere.utils = (typeof Stratosphere.utils=== 'undefined') ? { } : Stratosphere.utils;

Stratosphere.utils.isWhitelistingEnabled = function () {
	return !!(Meteor.settings && Meteor.settings.enableIpWhitelisting);
};