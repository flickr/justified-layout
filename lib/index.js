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

	return layoutData._layoutItems;
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