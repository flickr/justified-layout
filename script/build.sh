#!/usr/bin/env bash
set -ex

# Browserify
echo "Browserifying..."
mkdir -p ./dist
browserify -r $npm_package_main:justified-layout > ./dist/justified-layout.js
uglifyjs ./dist/justified-layout.js --comments -o ./dist/justified-layout.min.js
