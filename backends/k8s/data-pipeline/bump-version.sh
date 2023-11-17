#!/bin/bash

yaml_file=./yaml/ingest-environment.yaml

echo "Latest release version: $PIPELINE_VERSION"

imagename="undpgeohub.azurecr.io/geohub-data-pipeline"
pattern="${imagename}:[^ ]*"
sed "s|$pattern|$imagename:$PIPELINE_VERSION|g" $yaml_file > "${yaml_file}_new"

# replace yaml file with new version
mv "${yaml_file}_new" $yaml_file

echo "tag version was replace to $PIPELINE_VERSION"
