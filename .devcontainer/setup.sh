#!/bin/bash

# set the project directory as trusted in git
git config --global --add safe.directory $PWD

# install all dependency packages
npm install -g npm@9.4.1
npm install

# make package can be used in CLI
npm link git-cz 
npm link swaggerhub-cli 

# setup git-hook
yarn run githook-init