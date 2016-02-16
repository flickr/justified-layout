'use strict';

var merge = require('merge');

module.exports = function (input) {
	var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	// Defaults
	var defaults = {
		containerWidth: 1060,
		containerPadding: 10,
		boxSpacing: 10,
		targetRowHeight: 320,
		targetRowHeightTolerance: 0.25,
		maxNumRows: Number.POSITIVE_INFINITY,
		forceAspectRatio: false,
		alwaysDsiplayOrphans: true,
		fullWidthBreakoutRowCadence: false
	};

	// Merge defaults and config passed in
	var config = merge(config, defaults);

	return [];
};
