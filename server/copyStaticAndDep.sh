#!/bin/bash

log() {
    echo -e "🐜 \033[0;36m$1\033[0m"
}

copyc() {
	log "Copying ../$1"
	cp -Rf "../$1" web/static
}

copyc bin
copyc css
copyc favicons
copyc icons
copyc img
copyc index.html

log "Copying ../data"
cp -Rf "../data" web

log "Copying ../node_modules/material-design-icons/iconfont"
cp -Rf ../node_modules/material-design-icons/iconfont web/static/icons/iconfont

log "Copying ../node_modules/roboto-fontface/fonts"
cp -Rf ../node_modules/roboto-fontface/fonts web/static/

log "Copying timesync files"
cp ../node_modules/timesync/dist/* web/static

copyj() {
	log "Copying $1"
	cp $1 lib
}
