Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.authServer = (typeof Stratosphere.authServer === 'undefined') ? { } : Stratosphere.authServer;

Stratosphere.authServer.auth = function (request, response) {
	if (request && request.headers && request.headers.apikey && request.headers.host) {
		if (request.headers.apikey === Meteor.settings.ipWhitelistAuthKey) {
			Stratosphere.whitelisting.whitelistIpAddress(request.headers.host);

			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('ipAddress: ' + request.headers.host);
		}
		else {
			response.writeHead(403, {'Content-Type': 'text/plain'});
		}
	}
	else {
		response.writeHead(400, {'Content-Type': 'text/plain'});
	}

	response.end();
	return;
};

Stratosphere.authServer.start = function () {
	if (Meteor.settings.ipWhitelistAuthKey === 'CHANGE ME') {
		throw new Meteor.Error('In settigs the ipWhitelistAuthKey needs to be changed');
	}

	RoutePolicy.declare('/whitelist', 'network');
	WebApp.connectHandlers.use('/whitelist', Stratosphere.authServer.auth);
};
