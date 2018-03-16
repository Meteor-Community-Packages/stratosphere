Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.whitelisting = (typeof Stratosphere.whitelisting === 'undefined') ? { } : Stratosphere.whitelisting;

Stratosphere.whitelisting.start = function () {
	let allowedIpAddresses = IpWhitelist.find({ }).fetch();
	allowedIpAddresses.forEach(function (ipWhitelisting) {
		_addIpAddress(ipWhitelisting.ipAddress);
	});

	IPWhitelist();
};

Stratosphere.whitelisting.whitelistIpAddress = function (ipAddress) {
	IpWhitelist.insert({ipAddress: ipAddress});
	_addIpAddress(ipAddress);
};

let _addIpAddress = function (ipAddress) {
	let currentIpAddresses = (Meteor.settings && Meteor.settings.ipWhitelist);

	if (currentIpAddresses.indexOf(ipAddress) === -1) {
		currentIpAddresses.push(ipAddress);

		console.log('Added ip-address ' + ipAddress + ' to whitelist');
	}
};