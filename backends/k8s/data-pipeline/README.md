# geohub-data-pipeline deployment to Kubernetes

[geohub-data-pipeline](https://github.com/UNDP-Data/geohub-data-pipeline) is a python script to ingest the geospatial datasets uploaded to Azure Storege Account by pushing tasks through Azure Service Bus Queue and Azure WebPub Services.

- [Namespace](#namespace)
- [Installation](#installation)
- [Uninstall](#uninstall)
- [Automatic setup](#automatic-setup)
- [Config](#config)
- [Use case](#use-case)

## Namespace

The server lives in its namespace: **data** and the number of replicasets will be driven by the service bus queue event.

## Installation

```
kubectl apply -f yaml/ingest-deployment.yaml
```

The above command will create the following environment

- namespace
- ScaledJob

## Uninstall

To uninstall use the same yaml files i opposite order

```
kubectl delete -f yaml/ingest-deployment.yaml
```

## Secrets

The following secret needs to be registered in kubernetes prior to applying `ingest-deployment.yaml`

```bash
kubectl create secret generic ingest-secrets \
--from-literal=AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING \
--from-literal=SERVICE_BUS_CONNECTION_STRING=$SERVICE_BUS_CONNECTION_STRING \
--from-literal=AZURE_WEBPUBSUB_CONNECTION_STRING=$AZURE_WEBPUBSUB_CONNECTION_STRING \
-n data
```
