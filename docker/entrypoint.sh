#!/bin/sh
set -xe

echo "$(envsubst < build/index.html)" > build/index.html
exec "$@"
