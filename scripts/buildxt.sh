#!/bin/bash

# Builds the extension to distribute a testing build
if [ -d "../xt_distr" ]; then
    rm -rf "../xt_distr"
fi

log() {
    echo -e "🕑 \033[0;36m$1\033[0m"
}

DEST="xt_distr"
cd ..
mkdir $DEST
log "Building extension"
cd "chrome_extension"
../node_modules/.bin/webpack
cd ..

log "Copying manifest"
cp "manifest.json" $DEST
log "Copying icons"
cp -r "icons" $DEST
cp -r "favicons" $DEST
log "Copying img"
cp -r "img" $DEST

DEST="$DEST/chrome_extension"
mkdir $DEST
log "Copying html"
cp "chrome_extension/background.html" $DEST
cp "chrome_extension/popup.html" $DEST
log "Copying source"
cp -r "chrome_extension/bin" $DEST
log "Copying css"
cp -r "chrome_extension/css" $DEST
cp -r "chrome_extension/sizedicons" $DEST

zip -r bellxt.zip xt_distr
