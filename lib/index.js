'use strict';

var merge = require('merge'),
    Row = require('./row'),
    layoutConfig = {},
    currentRow = false;

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
	layoutConfig = merge(config, defaults);

	computeLayout([1]);

	return [];
};

/**
* Convert sizes to aspect ratios
*
* @method covertSizesToAspectRatios
* @param sizes {Array} Array of objects with widths and heights
* @return {Array} A list of aspect ratios
**/
function covertSizesToAspectRatios(sizes) {
	return sizes;
}

/**
* Calculate the current layout for all items in the list that require layout.
* "Layout" means geometry: position within container and size
*
* @method computeLayout
* @param itemLayoutData {Array} Array of items to lay out, with data required to lay out each item
* @param containerTop {Number} The top edge of the container, relative to the parent container or viewport.
* @param containerLeft {Object} The left edge of the container, relative to the parent container or viewport.
* @return {Object} The newly-calculated layout, containing the new container height, and lists of layout items
*/
function computeLayout(itemLayoutData, containerTop, containerLeft) {

	// Loop through the items
	itemLayoutData.some(function (itemData, i) {

		// If not currently building up a row, make a new one.
		if (!currentRow) {
			currentRow = new Row();
		}
	});

	return [];
}