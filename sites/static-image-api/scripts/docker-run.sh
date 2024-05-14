#!/bin/bash

if [ -z $IMAGE_NAME ]; then
    IMAGE_NAME=undp-data/geohub-static-image-api:v1
fi

if [ -z $PORT ]; then
    PORT=3000
fi

echo $IMAGE_NAME
echo $PORT

docker run -it -p $PORT:3000 $IMAGE_NAME