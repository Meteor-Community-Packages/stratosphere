Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.whitelisting = (typeof Stratosphere.whitelisting === 'undefined') ? { } : Stratosphere.whitelisting;

import { Environment, Firewall} from 'meteor/simonrycroft:ip-whitelist';
var rangeCheck = require('range_check');

IPWhitelist = function() {
	var environment = new Environment(),
		firewall = new Firewall(),
		whitelist = Meteor.settings.ipWhitelist;

	firewallAllowWithRangeCheck = function (ipAddress, whitelist) {
		var baseCheck = firewall.allow(ipAddress, whitelist);

		if (baseCheck) {
			return true;
		}
		else {
			whitelist.forEach(function (ipWhitelisting) {
				if (ipWhitelisting.indexOf('/') > -1) {
					let ipInRangeCheck = rangeCheck.inRange(ipAddress, ipWhitelisting);
					if (ipInRangeCheck) {
						return true;
					}
				}
			});
		}

		return false;
	};

	WebApp.connectHandlers.use(function(request, response, next) {
		var rawClientIPS = (request.headers['x-forwarded-for'] && request.headers['x-forwarded-for'].replace(' ', '').split(',')),
			clientIPs = (rawClientIPS && rawClientIPS[0]),
			hostRaw = (!clientIPs && request.headers && request.headers['host']),
			host = (hostRaw && hostRaw.split(':')[0]);
	
		if (!firewallAllowWithRangeCheck((clientIPs || host), whitelist) && (request.originalUrl !== '/whitelist')) {
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

	_observeRemoteChanges();

	IPWhitelist();
};

Stratosphere.whitelisting.whitelistIpAddress = function (ipAddress) {
	if (!IpWhitelist.findOne({ipAddress: ipAddress})) {
		IpWhitelist.insert({ipAddress: ipAddress});
	}

	_addIpAddress(ipAddress);
};

let _observeRemoteChanges = function () {
	if (Meteor.isServer) {
		IpWhitelist.find({ }).observe({
			added: function (doc) {
				if (doc && doc.ipAddress) {
					_addIpAddress(doc.ipAddress);
				}
			}
		});
	}
};

let _addIpAddress = function (ipAddress) {
	let currentIpAddresses = (Meteor.settings && Meteor.settings.ipWhitelist);

	if (currentIpAddresses.indexOf(ipAddress) === -1) {
		currentIpAddresses.push(ipAddress);

		console.log('Added ip-address ' + ipAddress + ' to whitelist');
	}
};