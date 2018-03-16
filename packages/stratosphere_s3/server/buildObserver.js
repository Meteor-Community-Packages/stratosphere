Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.observer = (typeof Stratosphere.observer === 'undefined') ? { } : Stratosphere.observer;

hound = require('hound');

let _isQueued = false,
	_isRunning = false,
	_isInitalized = false;


Stratosphere.observer.start = function () {
	_observeLocalBuilds();
	_observeLocalBuilds();
};

let _observeLocalBuilds = function () {
	let watcher = hound.watch(Meteor.settings.directories.uploads);

	watcher.on('create', function(file, stats) {
		_runSync();
	});

	watcher.on('change', function(file, stats) {
		_runSync();
	});
};

let _observeRemoteBuilds = function () {
	// builds on another node
	Builds.find({ }).observe({
		added: function (doc) {
			if (_isInitalized) {
				Meteor.setTimeout(_runSync, (60 * 1000));
			}
		}
	});

	// this is needed as all entries on the first load will otherwise trigger an event
	_isInitalized = true;
};

let _runSync = function () {
	if (_isRunning) {
		_isQueued = true;
	}
	else {
		_isRunning = true;
		_isQueued = false;
		Stratosphere.utils.syncToS3(function () {
			_isRunning = false;

			if(_isQueued) {
				_runSync();
			}
		});
	}
};