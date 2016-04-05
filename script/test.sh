#!/usr/bin/env bash

set -ex

# Run the tests
mocha

# Generate code coverage
npm run coverage