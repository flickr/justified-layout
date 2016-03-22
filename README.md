# justified-layout

http://flickr.github.io/justified-layout/

Pass in box sizes and get back sizes and coordinates for a justified layout.

Converts this: `[0.5, 1.5, 1, 1.8, 0.4, 0.7, 0.9, 1.1, 1.7, 2, 2.1]`

Into this:

```json
{
    "containerHeight": 1269,
    "boxes": [
        {
            "aspectRatio": 0.5,
            "top": 10,
            "width": 170,
            "height": 340,
            "left": 10
        },
        {
            "aspectRatio": 1.5,
            "top": 10,
            "width": 510,
            "height": 340,
            "left": 190
        },
        ...
    ]
}
```

Which you can use to make this:

![Demonstration](https://cloud.githubusercontent.com/assets/43693/13159568/50349cd4-d647-11e5-80a8-14724579302b.png)

## Install

`npm install justified-layout`


## Usage

```js
var layoutGeometry = require('justified-layout')([1.33, 1, 0.65] [, config])
```


## Input

There's two options for input, an array of objects with width and height properties or an array of numbers representing aspect ratios.

Option 1:

```js
[{
	width: 400,
	height: 300
},
{
	width: 300,
	height: 300
},
{
	width: 250,
	height: 400
}]
```

Option 2:

```js
[1.33, 1, 0.65]
```


## Config object

Optional configuration passed in as the second argument when calling the justified-layout function. Only pass in properties you'd like to override.

### config.containerWidth

Width in pixels of the container you're justifying boxes within.

Default: `1060`

### config.containerPadding

The space around the block of justified boxes in pixels. Can be specified with a single numeric value that applies to all sides or individually like this:

```js
containerPadding: {
	top: 50,
	right: 5,
	bottom: 50,
	left: 5
}
```

Default: `10`

### config.boxSpacing

The space between boxes in pixels. Can be specified with a single numeric value that applies to both horizontal and vertical spacing or individually like this:

```js
boxSpacing: {
	horizontal: 12,
	vertical: 8
}
```

Default: `10`

### config.targetRowHeight

This is the ideal height of each row of boxes in pixels. This likely won't be the exact row height but they'll be within the `targetRowHeightTolerance` of it.

Default: `320`

### config.targetRowHeightTolerance

The percentage of `targetRowHeight` we're willing to adjust boxes to fit them nicely within the row. 0 means they *must* be equal to the `targetRowHeight` and a nicely justified view might not be possible. Minimum value is 0 and maximum is 1.

Default: `0.25`

### config.maxNumRows

How many rows of boxes do you want? Defaults to outputting as many as you pass in.

Default: Number.POSITIVE_INFINITY

### config.forceAspectRatio

Set an aspect ratio that all boxes must be forced to.

Default: false

### config.alwaysDisplayOrphans

Sometimes we'll be left with some boxes that don't completely fill a row within the `targetRowHeightTolerance` at the end of the list. We can discard them or return them as best we can.

Default: true

### config.fullWidthBreakoutRowCadence

If you'd like to insert a full width box every *n* rows you can specify it with this parameter. The box on that row will ignore the `targetRowHeight`, make itself as wide as `containerWidth` - `containerPadding` and be as tall as its aspect ratio defines.

Default: false


## Output

justified-layout doesn't do any DOM rendering or HTML building. It simply outputs an array of geometry objects you can use to render how you like.

Given a very simple input like this (just square images):

```js
[1, 1, 1, 1]
```

You'd get an output like this:

```js
{
	containerHeight: 252.5,
	boxes: [
		{
			aspectRatio: 1,
			width: 252.5,
			height: 252.5,
			left: 10,
			top: 10
		},
		{
			aspectRatio: 1,
			width: 252.5,
			height: 252.5,
			left: 272.5,
			top: 10
		},
		{
			aspectRatio: 1,
			width: 252.5,
			height: 252.5,
			left: 535,
			top: 10
		},
		{
			aspectRatio: 1,
			width: 252.5,
			height: 252.5,
			left: 797.5,
			top: 10
		}
	]
}
```

## TODO

* [x] ~~Get demos published on the gh-pages branch~~ http://flickr.github.io/justified-layout/
* [ ] Implement right to left stacking
* [ ] Implement appending
* [ ] Implement forceAspectRatio
* [ ] Pull in the better orphan height handling
* [ ] Add support for the full width breakout row
* [ ] Get module published on npm
* [ ] Use the module in Embedr
* [ ] Add performance benchmarks