Stratosphere = (typeof Stratosphere === 'undefined') ? { } : Stratosphere;
Stratosphere.observer = (typeof Stratosphere.observer === 'undefined') ? { } : Stratosphere.observer;

hound = require('hound')

Stratosphere.observer.start = function () {
	let watcher = hound.watch(Meteor.settings.directories.uploads);

	watcher.on('create', function(file, stats) {
		Stratosphere.utils.syncToS3();
	});

	watcher.on('change', function(file, stats) {
		Stratosphere.utils.syncToS3();
	});
};
