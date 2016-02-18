require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var merge = require('merge');

/**
* Row
* Wrapper for each row in a justified layout.
* Stores relevant values and provides methods for calculating layout of individual rows.
*
* @param {Object} layoutConfig - The same as that passed
* @param {Object} Initialization paramters. The following are all required:
* @param params.top {Number} Top of row, relative to container
* @param params.left {Number} Left side of row relative to container (equal to container left padding)
* @param params.width {Number} Width of row, not including container padding
* @param params.spacing {Number} Horizontal spacing between items
* @param params.targetRowHeight {Number} Layout algorithm will aim for this row height
* @param params.targetRowHeightTolerance {Number} Row heights may vary +/- (`targetRowHeight` x `targetRowHeightTolerance`)
* @param params.edgeCaseMinRowHeight {Number} Absolute minimum row height for edge cases that cannot be resolved within tolerance.
* @param params.edgeCaseMaxRowHeight {Number} Absolute maximum row height for edge cases that cannot be resolved within tolerance.
* @param params.isBreakoutRow {Boolean} Is this row in particular one of those breakout rows? Always false if it's not that kind of photo list
* @constructor
*/
var Row = module.exports = function (params) {

	// Top of row, relative to container
	this.top = params.top;

	// Left side of row relative to container (equal to container left padding)
	this.left = params.left;

	// Width of row, not including container padding
	this.width = params.width;

	// Horizontal spacing between items
	this.spacing = params.spacing;

	// Row height calculation values
	this.targetRowHeight = params.targetRowHeight;
	this.targetRowHeightTolerance = params.targetRowHeightTolerance;
	this.minAspectRatio = this.width / params.targetRowHeight * (1 - params.targetRowHeightTolerance);
	this.maxAspectRatio = this.width / params.targetRowHeight * (1 + params.targetRowHeightTolerance);

	// Edge case row height minimum/maximum
	this.edgeCaseMinRowHeight = params.edgeCaseMinRowHeight || Number.NEGATIVE_INFINITY;
	this.edgeCaseMaxRowHeight = params.edgeCaseMaxRowHeight || Number.POSITIVE_INFINITY;

	// Layout direction
	this.rightToLeft = params.rightToLeft;

	// Full width breakout rows
	this.isBreakoutRow = params.isBreakoutRow;

	// Store layout data for each item in row
	this.items = [];

	// Height remains at 0 until it's been calculated
	this.height = 0;
};

Row.prototype = {

	/**
 * Attempt to add a single item to the row.
 * This is the heart of the justified algorithm.
 * This method is direction-agnostic; it deals only with sizes, not positions.
 *
 * If the item fits in the row, without pushing row height beyond min/max tolerance,
 * the item is added and the method returns true.
 *
 * If the item leaves row height too high, there may be room to scale it down and add another item.
 * In this case, the item is added and the method returns true, but the row is incomplete.
 *
 * If the item leaves row height too short, there are too many items to fit within tolerance.
 * The method will either accept or reject the new item, favoring the resulting row height closest to within tolerance.
 * If the item is rejected, left/right padding will be required to fit the row height within tolerance;
 * if the item is accepted, top/bottom cropping will be required to fit the row height within tolerance.
 *
 * @method addItem
 * @param itemData {Object} Item layout data, containing item aspect ratio.
 * @return {Boolean} True if successfully added; false if rejected.
 */
	addItem: function addItem(itemData) {

		var newItems = this.items.concat(itemData),
		   
		// Calculate aspect ratios for items only; exclude spacing
		rowWidthWithoutSpacing = this.width - (newItems.length - 1) * this.spacing,
		    newAspectRatio = newItems.reduce(function (sum, item) {
			return sum + item.aspectRatio;
		}, 0),
		    targetAspectRatio = rowWidthWithoutSpacing / this.targetRowHeight,
		    previousRowWidthWithoutSpacing,
		    previousAspectRatio,
		    previousTargetAspectRatio;

		if (newAspectRatio === 0) {
			// Error state (item not added, row layout not complete);
			// handled by consumer
			return false;
		}

		if (newAspectRatio < this.minAspectRatio) {

			// New aspect ratio is too narrow / scaled row height is too tall.
			// Accept this item and leave row open for more items.

			this.items.push(merge(itemData));
			return true;
		} else if (newAspectRatio > this.maxAspectRatio) {

			// New aspect ratio is too wide / scaled row height will be too short.
			// Accept item if the resulting aspect ratio is closer to target than it would be without the item.
			// NOTE: Any row that falls into this block will require cropping/padding on individual items.

			if (this.items.length === 0) {

				// When there are no existing items, force acceptance of the new item and complete the layout.
				// This is the pano special case.
				this.items.push(merge(itemData));
				this.completeLayout(rowWidthWithoutSpacing / newAspectRatio);
				return true;
			}

			// Calculate width/aspect ratio for row before adding new item
			previousRowWidthWithoutSpacing = this.width - (this.items.length - 1) * this.spacing;
			previousAspectRatio = this.items.reduce(function (sum, item) {
				return sum + item.aspectRatio;
			}, 0);
			previousTargetAspectRatio = previousRowWidthWithoutSpacing / this.targetRowHeight;

			if (Math.abs(newAspectRatio - targetAspectRatio) > Math.abs(previousAspectRatio - previousTargetAspectRatio)) {

				// Row with new item is us farther away from target than row without; complete layout and reject item.
				this.completeLayout(previousRowWidthWithoutSpacing / previousAspectRatio);
				return false;
			} else {

				// Row with new item is us closer to target than row without;
				// accept the new item and complete the row layout.
				this.items.push(merge(itemData));
				this.completeLayout(rowWidthWithoutSpacing / newAspectRatio);
				return true;
			}
		} else {

			// New aspect ratio / scaled row height is within tolerance;
			// accept the new item and complete the row layout.
			this.items.push(merge(itemData));
			this.completeLayout(rowWidthWithoutSpacing / newAspectRatio);
			return true;
		}
	},

	/**
 * Check if a row has completed its layout.
 *
 * @method isLayoutComplete
 * @return {Boolean} True if complete; false if not.
 */
	isLayoutComplete: function isLayoutComplete() {
		return this.height > 0;
	},

	/**
 * Set row height and compute item geometry from that height.
 * Will justify items within the row unless instructed not to.
 *
 * @method completeLayout
 * @param newHeight {Number} Set row height to this value.
 * @param justify Apply error correction to ensure photos exactly fill the row. Defaults to `true`.
 */
	completeLayout: function completeLayout(newHeight, justify) {

		var itemWidthSum = this.rightToLeft ? -this.left : this.left,
		    rowWidthWithoutSpacing = this.width - (this.items.length - 1) * this.spacing,
		    clampedToNativeRatio,
		    roundedHeight,
		    clampedHeight,
		    errorWidthPerItem,
		    roundedCumulativeErrors,
		    singleItemGeometry,
		    self = this;

		// Justify unless explicitly specified otherwise.
		if (typeof justify === 'undefined') {
			justify = true;
		}

		// Don't set fractional values in the layout.
		roundedHeight = Math.round(newHeight);

		// Clamp row height to edge case minimum/maximum.
		clampedHeight = Math.max(this.edgeCaseMinRowHeight, Math.min(roundedHeight, this.edgeCaseMaxRowHeight));

		if (roundedHeight !== clampedHeight) {

			// If row height was clamped, the resulting row/item aspect ratio will be off,
			// so force it to fit the width (recalculate aspectRatio to match clamped height).
			// NOTE: this will result in cropping/padding commensurate to the amount of clamping.
			this.height = clampedHeight;
			clampedToNativeRatio = rowWidthWithoutSpacing / clampedHeight / (rowWidthWithoutSpacing / roundedHeight);
		} else {

			// If not clamped, leave ratio at 1.0.
			this.height = roundedHeight;
			clampedToNativeRatio = 1.0;
		}

		// Compute item geometry based on newHeight.
		this.items.forEach(function (item, i) {

			item.top = self.top;
			item.width = Math.round(item.aspectRatio * self.height * clampedToNativeRatio);
			item.height = self.height;

			if (self.rightToLeft) {

				// Right-to-left.
				item.left = self.width - itemWidthSum - item.width;
			} else {

				// Left-to-right.
				item.left = itemWidthSum;
			}

			// Incrememnt width.
			itemWidthSum += item.width + self.spacing;
		});

		// If specified, ensure items fill row and distribute error
		// caused by rounding width and height across all items.
		if (justify) {

			// Left-to-right increments itemWidthSum differently;
			// account for that before distributing error.
			if (!this.rightToLeft) {
				itemWidthSum -= this.spacing + this.left;
			}

			errorWidthPerItem = (itemWidthSum - this.width) / this.items.length;
			roundedCumulativeErrors = this.items.map(function (item, i) {
				return Math.round((i + 1) * errorWidthPerItem);
			});

			if (this.items.length === 1) {

				// For rows with only one item, adjust item width to fill row.
				singleItemGeometry = this.items[0];
				singleItemGeometry.width -= Math.round(errorWidthPerItem);

				// In right-to-left layouts, shift item to account for width change.
				if (this.rightToLeft) {
					singleItemGeometry.left += Math.round(errorWidthPerItem);
				}
			} else {

				// For rows with multiple items, adjust item width and shift items to fill the row,
				// while maintaining equal spacing between items in the row.
				this.items.forEach(function (item, i) {
					if (i > 0) {
						item.left -= roundedCumulativeErrors[i - 1];
						item.width -= roundedCumulativeErrors[i] - roundedCumulativeErrors[i - 1];
					} else {
						item.width -= roundedCumulativeErrors[i];
					}
				});
			}
		}
	},

	/**
 * Force completion of row layout with current items.
 *
 * @method forceComplete
 * @param fitToWidth {Boolean} Stretch current items to fill the row width.
 *                             This will likely result in padding.
 * @param fitToWidth {Number}
 */
	forceComplete: function forceComplete(fitToWidth, rowHeight) {

		var rowWidthWithoutSpacing = this.width - (this.items.length - 1) * this.spacing,
		    currentAspectRatio = this.items.reduce(function (sum, item) {
			return sum + item.aspectRatio;
		}, 0);

		if (typeof rowHeight === 'number') {

			this.completeLayout(rowHeight, false);
		} else if (fitToWidth) {

			// Complete using height required to fill row with current items.
			this.completeLayout(rowWidthWithoutSpacing / currentAspectRatio);
		} else {

			// Complete using target row height.
			this.completeLayout(this.targetRowHeight, false);
		}
	},

	/**
 * Return layout data for items within row.
 * Note: returns actual list, not a copy.
 *
 * @method getItems
 * @return Layout data for items within row.
 */
	getItems: function getItems() {
		return this.items;
	}

};
},{"merge":2}],2:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.2.0
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	/**
	 * Merge one or more objects 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	var Public = function(clone) {

		return merge(clone === true, false, arguments);

	}, publicName = 'merge';

	/**
	 * Merge two or more objects recursively 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	Public.recursive = function(clone) {

		return merge(clone === true, true, arguments);

	};

	/**
	 * Clone the input removing any reference
	 * @param mixed input
	 * @return mixed
	 */

	Public.clone = function(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = Public.clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = Public.clone(input[index]);

		}

		return output;

	};

	/**
	 * Merge two objects recursively
	 * @param mixed input
	 * @param mixed extend
	 * @return mixed
	 */

	function merge_recursive(base, extend) {

		if (typeOf(base) !== 'object')

			return extend;

		for (var key in extend) {

			if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

				base[key] = merge_recursive(base[key], extend[key]);

			} else {

				base[key] = extend[key];

			}

		}

		return base;

	}

	/**
	 * Merge two or more objects
	 * @param bool clone
	 * @param bool recursive
	 * @param array argv
	 * @return object
	 */

	function merge(clone, recursive, argv) {

		var result = argv[0],
			size = argv.length;

		if (clone || typeOf(result) !== 'object')

			result = {};

		for (var index=0;index<size;++index) {

			var item = argv[index],

				type = typeOf(item);

			if (type !== 'object') continue;

			for (var key in item) {

				var sitem = clone ? Public.clone(item[key]) : item[key];

				if (recursive) {

					result[key] = merge_recursive(result[key], sitem);

				} else {

					result[key] = sitem;

				}

			}

		}

		return result;

	}

	/**
	 * Get type of variable
	 * @param mixed input
	 * @return string
	 *
	 * @see http://jsperf.com/typeofvar
	 */

	function typeOf(input) {

		return ({}).toString.call(input).slice(8, -1).toLowerCase();

	}

	if (isNode) {

		module.exports = Public;

	} else {

		window[publicName] = Public;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],"justified-layout":[function(require,module,exports){
'use strict';

var merge = require('merge'),
    Row = require('./row'),
    layoutConfig = {},
    layoutData = {},
    currentRow = false;

/**
* Takes in a bunch of box data and config. Returns
* geometry to lay them out in a justified view.
*
* @method covertSizesToAspectRatios
* @param sizes {Array} Array of objects with widths and heights
* @return {Array} A list of aspect ratios
**/
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
		alwaysDisplayOrphans: true,
		fullWidthBreakoutRowCadence: false
	};

	// Merge defaults and config passed in
	layoutConfig = merge(config, defaults);

	// Local
	layoutData._layoutItems = [];
	layoutData._awakeItems = [];
	layoutData._inViewportItems = [];
	layoutData._leadingOrphans = [];
	layoutData._trailingOrphans = [];
	layoutData._containerHeight = layoutConfig.containerPadding.top || layoutConfig.containerPadding;
	layoutData._rows = [];
	layoutData._orphans = [];

	// Convert widths and heights to aspect ratios if we need to
	return computeLayout(input.map(function (item) {
		if (item.width && item.width) {
			return { aspectRatio: item.width / item.height };
		} else {
			return { aspectRatio: item };
		}
	}));
};

/**
* Calculate the current layout for all items in the list that require layout.
* "Layout" means geometry: position within container and size
*
* @method computeLayout
* @param itemLayoutData {Array} Array of items to lay out, with data required to lay out each item
* @return {Object} The newly-calculated layout, containing the new container height, and lists of layout items
*/
function computeLayout(itemLayoutData) {

	var notAddedNotComplete,
	    laidOutItems = [],
	    itemAdded,
	    currentRow;

	// Loop through the items
	itemLayoutData.some(function (itemData, i) {

		notAddedNotComplete = false;

		// If not currently building up a row, make a new one.
		if (!currentRow) {
			currentRow = createNewRow();
		}

		// Attempt to add item to the current row.
		itemAdded = currentRow.addItem(itemData);

		if (currentRow.isLayoutComplete()) {

			// Row is filled; add it and start a new one
			laidOutItems = laidOutItems.concat(addRow(currentRow));
			if (layoutData._rows.length >= layoutConfig.maxNumRows) {
				currentRow = null;
				return true;
			}

			currentRow = createNewRow();

			// Item was rejected; add it to its own row
			if (!itemAdded) {

				itemAdded = currentRow.addItem(itemData);

				if (currentRow.isLayoutComplete()) {

					// If the rejected item fills a row on its own, add the row and start another new one
					laidOutItems = laidOutItems.concat(addRow(currentRow));
					if (layoutData._rows.length >= layoutConfig.maxNumRows) {
						currentRow = null;
						return true;
					}
					currentRow = createNewRow();
				} else if (!itemAdded) {
					notAddedNotComplete = true;
				}
			}
		} else {

			if (!itemAdded) {
				notAddedNotComplete = true;
			}
		}
	});

	// Handle any leftover content (orphans) depending on where they lie
	// in this layout update, and in the total content set.
	if (currentRow && currentRow.getItems().length && layoutConfig.alwaysDisplayOrphans) {
		currentRow.forceComplete(false);
		laidOutItems = laidOutItems.concat(addRow(currentRow));
	}

	return {
		containerHeight: layoutData._containerHeight,
		boxes: layoutData._layoutItems
	};
}

/**
* Create a new, empty row.
*
* @method createNewRow
* @return A new, empty row of the type specified by this layout.
*/
function createNewRow() {

	return new Row({
		top: layoutData._containerHeight,
		left: layoutConfig.containerPadding.left || layoutConfig.containerPadding,
		width: layoutConfig.containerWidth - (layoutConfig.containerPadding.left || layoutConfig.containerPadding) - (layoutConfig.containerPadding.right || layoutConfig.containerPadding),
		spacing: layoutConfig.boxSpacing.horizontal || layoutConfig.boxSpacing,
		targetRowHeight: layoutConfig.targetRowHeight,
		targetRowHeightTolerance: layoutConfig.targetRowHeightTolerance,
		edgeCaseMinRowHeight: 0.5 * layoutConfig.targetRowHeight,
		edgeCaseMaxRowHeight: 2 * layoutConfig.targetRowHeight,
		rightToLeft: false,
		isBreakoutRow: false
	});
}

/**
 * Add a completed row to the layout.
 * Note: the row must have already been completed.
 *
 * @method addRow
 * @param row {Row} The row to add.
 * @return {Array} Each item added to the row.
 */
function addRow(row) {

	layoutData._rows.push(row);
	layoutData._layoutItems = layoutData._layoutItems.concat(row.getItems());

	// Increment the container height
	layoutData._containerHeight += row.height + (layoutConfig.boxSpacing.vertical || layoutConfig.boxSpacing);

	return row.items;
}
},{"./row":1,"merge":2}]},{},[]);
