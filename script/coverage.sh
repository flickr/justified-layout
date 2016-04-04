#!/usr/bin/env bash
set -ex

# Generate the coverage report
istanbul cover _mocha test/test.js --report lcovonly -- -R spec

# Pipe it into coveralls
cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js -v

# Delete coverage artifacts
rm -rf ./coverage
