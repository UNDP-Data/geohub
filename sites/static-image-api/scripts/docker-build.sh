#!/bin/bash

if [ -z $IMAGE_NAME ]; then
    IMAGE_NAME=undp-data/geohub-static-image-api:v1
fi

echo $IMAGE_NAME
echo $PORT

# build Docker image
docker build . \
--file Dockerfile \
--tag $IMAGE_NAME
