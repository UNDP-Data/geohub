#!/bin/bash

IMAGE_NAME=undp-data/geohub:v1
PORT=3000
ENV_FILE=./sites/geohub/.env

docker run -it -p $PORT:3000 --env-file=$ENV_FILE $IMAGE_NAME