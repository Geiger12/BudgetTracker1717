#!/bin/sh
set -e
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=1
cd "$CI_PRIMARY_REPOSITORY_PATH"
brew install node
npm ci
