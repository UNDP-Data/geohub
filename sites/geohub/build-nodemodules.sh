#!/bin/bash

# This script must be executed after pnpm build to make sure node_modules is under build folder for production nodejs server
rm -rf node_modules
sed -e 's/workspace://g' ./package.json > ./package2.json
rm package.json
mv package2.json package.json
npm install --omit=dev --legacy-peer-deps
mv node_modules build/.