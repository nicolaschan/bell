#!/bin/bash

if [[ "$1" != "dev" ]]; then
  exit 0
fi

docker rm -f bell-dev || true
docker run \
  -e WEBSERVER_PORT=8080 \
  -e SERVER_NAME=bell-dev-ci \
  -e POSTGRES_ENABLED=false \
  -e POSTGRES_USER=false \
  -e POSTGRES_HOST=false \
  -e POSTGRES_DATABASE=false \
  -e POSTGRES_PASSWORD=false \
  -e POSTGRES_PORT=false \
  -p 8102:8080 --name bell-dev -d bell:dev
