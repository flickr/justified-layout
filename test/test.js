// Copyright 2016 Yahoo Inc.
// Licensed under the terms of the New-BSD license. Please see LICENSE file in the project root for terms.

var justifiedLayout = require('..');
var expect = require('expect');
var fourSquares = require(__dirname + '/fixtures/four-squares');
var fourSquares400 = require(__dirname + '/fixtures/four-squares-400');

describe('justified-layout', function() {

	describe('input', function() {

		it('should handle width and height objects as input', function() {
			expect(justifiedLayout([{
				width: 400,
				height: 400
			}, {
				width: 500,
				height: 500
			}, {
				width: 600,
				height: 600
			}, {
				width: 700,
				height: 700
			}])).toEqual(fourSquares);
		});

		it('should handle an array of aspect ratios as input', function() {
			expect(justifiedLayout([1, 1, 1, 1])).toEqual(fourSquares);
		});

	});

	describe('config', function() {

		it('should return a layout without passing in a config', function() {
			expect(justifiedLayout([1, 1, 1, 1])).toEqual(fourSquares);
		});

		it('should allow overriding of containerWidth', function() {
			expect(justifiedLayout([1, 1, 1, 1], {
				containerWidth: 400
			})).toEqual(fourSquares400);
		});

		it('should allow overriding of containerPadding', function() {

			var geometry = justifiedLayout([1], {
				containerPadding: 20
			});

			expect(geometry.boxes[0].top).toEqual(20);
			expect(geometry.boxes[0].left).toEqual(20);

		});

		it('should allow overriding of containerPadding with multiple dimensions', function() {

			var geometry = justifiedLayout([1], {
				containerPadding: {
					top: 50,
					left: 5,
					bottom: 10,
					right: 10
				}
			});

			expect(geometry.boxes[0].top).toEqual(50);
			expect(geometry.boxes[0].left).toEqual(5);

		});

		it('should allow overriding of boxSpacing', function() {

			var geometry = justifiedLayout([1, 1, 1, 1], {
				boxSpacing: 40
			});

			// 10 + 320 + 40 = 370
			expect(geometry.boxes[1].left).toEqual(370);
			expect(geometry.boxes[3].top).toEqual(370);

		});

		it('should allow overriding of boxSpacing with multiple dimensions', function() {

			var geometry = justifiedLayout([1, 1, 1, 1], {
				boxSpacing: {
					horizontal: 40,
					vertical: 5
				}
			});

			// 10 + 320 + 40 = 370
			expect(geometry.boxes[1].left).toEqual(370);
			// 10 + 320 + 5 = 335
			expect(geometry.boxes[3].top).toEqual(335);

		});

		it('should allow overriding of targetRowHeight', function() {

			var geometry = justifiedLayout([1, 1, 1, 1], {
				targetRowHeight: 255,
				targetRowHeightTolerance: 0
			});

			expect(geometry.boxes[0].height).toEqual(255);

		});

		it('should allow overriding of targetRowHeightTolerance', function() {

			var geometry = justifiedLayout([1, 1, 1], {
				targetRowHeightTolerance: 0
			});

			expect(geometry.boxes[0].height).toEqual(320);

		});

		it('should allow overriding of maxNumRows', function() {

			var geometry = justifiedLayout([1, 1, 1, 1, 1], {
				maxNumRows: 1
			});

			expect(geometry.boxes.length).toEqual(3);

		});

		it('should allow overriding of forceAspectRatio', function() {

			var geometry = justifiedLayout([2, 2, 2, 2], {
				forceAspectRatio: 1
			});

			expect(geometry.boxes[0].width).toEqual(340);
			expect(geometry.boxes[0].height).toEqual(340);
			expect(geometry.boxes[0].forcedAspectRatio).toEqual(true);

		});

		it('should allow overriding of showWidows', function() {

			var geometry = justifiedLayout([1, 1, 1, 1], {
				showWidows: false
			});

			expect(geometry.boxes.length).toEqual(3);

		});

		it('should allow overriding of fullWidthBreakoutRowCadence', function() {

			var geometry = justifiedLayout([1, 1, 1, 1, 2, 2, 2, 2], {
				fullWidthBreakoutRowCadence: 3
			});

			expect(geometry.boxes[5].width).toEqual(1040);
			expect(geometry.boxes[5].top).toEqual(713);
			expect(geometry.boxes[6].top).toEqual(geometry.boxes[5].top + geometry.boxes[5].height + 10);

		});

	});

	describe('orphans', function() {

		it('should set them at the same height as previous rows which looks nicer', function() {

			var geometry = justifiedLayout([1, 1, 1, 1]);

			expect(geometry.boxes[0].height).toEqual(geometry.boxes[3].height);

		});

	});

	describe('containerPadding', function() {

		it('should add padding to the bottom of the container too', function() {

			var geometry = justifiedLayout([1], {
				containerPadding: 100
			});

			// 100 + 320 + 100
			expect(geometry.containerHeight).toEqual(520);

		});

		it('should handle 0 padding', function() {

			var geometry = justifiedLayout([1, 1, 1], {
				containerPadding: 0,
				targetRowHeightTolerance: 0
			});

			expect(geometry.containerHeight).toEqual(320);

		});

	});

});
