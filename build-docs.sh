#!/bin/bash

# Compile styles
gulp compile:styles:example --config=.markguiderc.json
gulp compile:styles:assets --config=.markguiderc.json
gulp compile:styles:assets:markguide --config=.markguiderc.json

# Build markguide
node bin/markguide.js --build=.markguiderc.json

# Ensure we're on the main branch
git checkout main

# Switch to gh-pages branch
git checkout gh-pages

# Copy the folder _example/markguide-static to markguide-static
cp -r _example/markguide-static markguide-static

# Remove the old docs folder
rm -rf docs

# Rename markguide-static to docs
mv markguide-static docs

# Stage the new docs folder for commit
git add docs

# Create a commit
git commit -m "auto docs update"

# Push changes to gh-pages branch
git push origin gh-pages

# Switch back to the main branch
git checkout main
