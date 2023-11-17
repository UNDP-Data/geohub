#!/bin/bash

yaml_file=./yaml/ingest-environment.yaml
url=https://api.github.com/repos/undp-data/geohub-data-pipeline/releases/latest

# extract the latest tag version
tag_name=$(curl -s $url | jq --raw-output '.tag_name')

echo "Latest release version: $tag_name"

imagename="undpgeohub.azurecr.io/geohub-data-pipeline"
pattern="${imagename}:[^ ]*"
sed "s|$pattern|$imagename:$tag_name|g" $yaml_file > "${yaml_file}_new"

# replace yaml file with new version
mv "${yaml_file}_new" $yaml_file

echo "tag version was replace to $tag_name"
