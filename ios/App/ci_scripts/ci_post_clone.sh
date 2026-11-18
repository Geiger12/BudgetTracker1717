#!/bin/sh
# Xcode Cloud runs this right after it downloads the repo.
# It installs the Capacitor plugins that the CapApp-SPM package points to,
# which fixes "Missing package product 'CapApp-SPM'".
set -e

cd "$CI_PRIMARY_REPOSITORY_PATH"

# Xcode Cloud does not come with Node
brew install node

node --version
npm ci
