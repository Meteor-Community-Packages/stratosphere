Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.whitelisting = (typeof Stratosphere.whitelisting === 'undefined') ? { } : Stratosphere.whitelisting;

import { Environment, Firewall} from 'meteor/simonrycroft:ip-whitelist';

IPWhitelist = function() {
	var environment = new Environment(),
		firewall = new Firewall(),
		whitelist = Meteor.settings.ipWhitelist,
		clientIPs;

	WebApp.connectHandlers.use(function(request, response, next) {
		clientIPs = request.headers['x-forwarded-for']
			.replace(' ', '')
			.split(',')
			.toString();
	
		if (!firewall.allow(clientIPs, whitelist) && (request.originalUrl !== '/whitelist')) {
			console.log('Access denied for ip-address ' + clientIPs);

			response.writeHead(404);
			response.end();
		}
		else {
			next();
		}
	});
};


Stratosphere.whitelisting.start = function () {
	let allowedIpAddresses = IpWhitelist.find({ }).fetch();
	allowedIpAddresses.forEach(function (ipWhitelisting) {
		_addIpAddress(ipWhitelisting.ipAddress);
	});

	IPWhitelist();
};

Stratosphere.whitelisting.whitelistIpAddress = function (ipAddress) {
	if (!IpWhitelist.findOne({ipAddress: ipAddress})) {
		IpWhitelist.insert({ipAddress: ipAddress});
	}

	_addIpAddress(ipAddress);
};

let _addIpAddress = function (ipAddress) {
	let currentIpAddresses = (Meteor.settings && Meteor.settings.ipWhitelist);

	if (currentIpAddresses.indexOf(ipAddress) === -1) {
		currentIpAddresses.push(ipAddress);

		console.log('Added ip-address ' + ipAddress + ' to whitelist');
	}
};