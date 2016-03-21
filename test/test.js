var justifiedLayout = require('../lib/index');
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

		it('it should allow overriding of containerWidth', function() {
			expect(justifiedLayout([1, 1, 1, 1], {
				containerWidth: 400
			})).toEqual(fourSquares400);
		});

		xit('it should allow overriding of containerPadding', function() {

		});

		xit('it should allow overriding of containerPadding with multiple dimensions', function() {

		});

		xit('it should allow overriding of boxSpacing', function() {

		});

		xit('it should allow overriding of boxSpacing with multiple dimensions', function() {

		});

		xit('it should allow overriding of targetRowHeight', function() {

		});

		xit('it should allow overriding of targetRowHeightTolerance', function() {

		});

		xit('it should allow overriding of maxNumRows', function() {

		});

		xit('it should allow overriding of forceAspectRatio', function() {

		});

		xit('it should allow overriding of alwaysDsiplayOrphans', function() {

		});

		xit('it should allow overriding of fullWidthBreakoutRowCadence', function() {

		});

	});

});
