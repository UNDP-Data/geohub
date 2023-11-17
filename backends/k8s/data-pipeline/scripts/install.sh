#!/bin/bash

# Source the .env file located in the same directory as the script
. .env
# Rest of the script
kubectl apply -f ../yaml/ingest-environment.yaml
# create secret with environmental variables
kubectl create secret generic ingest-secrets \
--from-literal=AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING \
--from-literal=SERVICE_BUS_CONNECTION_STRING=$SERVICE_BUS_CONNECTION_STRING \
--from-literal=AZURE_WEBPUBSUB_CONNECTION_STRING=$AZURE_WEBPUBSUB_CONNECTION_STRING \
-n data


