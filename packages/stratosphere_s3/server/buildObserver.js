Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.observer = (typeof Stratosphere.observer === 'undefined') ? { } : Stratosphere.observer;

hound = require('hound');

let _isQueued = false,
	_isRunning = false;

Stratosphere.observer.start = function () {
	let watcher = hound.watch(Meteor.settings.directories.uploads);

	watcher.on('create', function(file, stats) {
		_runSync();
	});

	watcher.on('change', function(file, stats) {
		_runSync();
	});
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