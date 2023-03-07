#!/bin/bash

if [ -z $IMAGE_NAME ]; then
    IMAGE_NAME=undp-data/geohub:v1
fi

if [ -z $PORT ]; then
    PORT=3000
fi

# load environmental variables
if [ -z $ENV_FILE ]; then
    ENV_FILE=./sites/geohub/.env
fi

echo $IMAGE_NAME
echo $PORT
echo $ENV_FILE

docker run -it -p $PORT:3000 --env-file=$ENV_FILE $IMAGE_NAME