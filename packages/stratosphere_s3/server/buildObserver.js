Stratosphere = (typeof Stratosphere=== 'undefined') ? { } : Stratosphere;
Stratosphere.observer = (typeof Stratosphere.observer=== 'undefined') ? { } : Stratosphere.observer;

var _isInitalized = false;

Stratosphere.observer.start = function () {
	Builds.find({ }).observe({
		added: function (doc) {
			if (_isInitalized) {
				Stratosphere.utils.syncToS3();
			}
		},
		removed: function (oldDoc) {
			if (_isInitalized) {
				Stratosphere.utils.syncToS3();
			}
		}
	});

	_isInitalized = true;
};
