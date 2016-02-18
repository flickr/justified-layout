#!/usr/bin/env bash

# Babelify
babel src --out-dir lib

# Browserify
browserify -r ./lib/index.js:justified-layout > ./dist/justified-layout.js; uglify -s ./dist/justified-layout.js -o ./dist/justified-layout.min.js