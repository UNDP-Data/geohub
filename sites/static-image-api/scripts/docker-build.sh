#!/bin/bash

if [ -z $IMAGE_NAME ]; then
    IMAGE_NAME=undp-data/geohub-static-image-api:v1
fi

# load environmental variables
# if [ -n $ENV_FILE ]; then
#     echo "load environmental variables from ${ENV_FILE}"
#     source $ENV_FILE
# fi

echo $IMAGE_NAME
echo $PORT

# build Docker image
docker build . \
--file Dockerfile \
--tag $IMAGE_NAME
# --build-arg AZURE_STORAGE_ACCOUNT=$AZURE_STORAGE_ACCOUNT \
# --build-arg AZURE_STORAGE_ACCESS_KEY=$AZURE_STORAGE_ACCESS_KEY \
# --build-arg AZURE_STORAGE_ACCOUNT_UPLOAD=$AZURE_STORAGE_ACCOUNT_UPLOAD \
# --build-arg DATABASE_CONNECTION=$DATABASE_CONNECTION \
# --build-arg PGTILESERV_API_ENDPOINT=$PGTILESERV_API_ENDPOINT \
# --build-arg AUTH_SECRET=$AUTH_SECRET \
# --build-arg AZURE_AD_TENANT_ID=$AZURE_AD_TENANT_ID \
# --build-arg AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID \
# --build-arg AZURE_AD_CLIENT_SECRET=$AZURE_AD_CLIENT_SECRET \
# --build-arg AZURE_SERVICE_BUS_CONNECTIONSTRING=$AZURE_SERVICE_BUS_CONNECTIONSTRING \
# --build-arg AZURE_SERVICE_BUS_QUEUE_NAME=$AZURE_SERVICE_BUS_QUEUE_NAME \
# --build-arg TITILER_ENDPOINT=$TITILER_ENDPOINT
