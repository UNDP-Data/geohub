#!/bin/bash

NAMESPACE=stac
SECRET_NAME=stac-secrets

# Source the .env file located in the same directory as the script
. .env
# Rest of the script
kubectl apply -f ../yaml/deployment.yaml
# create secret with environmental variables
kubectl create secret generic $SECRET_NAME \
--from-literal=AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING \
--from-literal=AZURE_SERVICE_BUS_CONNECTION_STRING=$AZURE_SERVICE_BUS_CONNECTION_STRING \
--from-literal=AZURE_SERVICE_BUS_QUEUE_NAME=$AZURE_SERVICE_BUS_QUEUE_NAME \
--from-literal=EOG_CLIENT_ID=$EOG_CLIENT_ID \
--from-literal=EOG_PASSWORD=$EOG_PASSWORD \
--from-literal=EOG_CLIENT_SECRET=$EOG_CLIENT_SECRET \
--from-literal=EOG_PASSWORD=$EOG_PASSWORD \
-n $NAMESPACE


