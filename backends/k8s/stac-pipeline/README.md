# undp stac data pipeline

[geo-undpstac-pipeline](https://github.com/UNDP-Data/geo-undpstac-pipeline) is a command line tool to ingest datasets and convert it into STAC items. This pipeline is deployed into Azure Kubernetes Service by using ScaledJob which is triggered by Azure Service Bus Queue Event.

- [Namespace](#namespace)
- [Installation](#installation)
- [Uninstall](#uninstall)

## Namespace

The server lives in its namespace: **stac** and features 1 replicaset

## Installation

It requires to create a secret to store database connection string prior to apply `deployment.yaml` by kubectl command.

```shell
cd scripts
cp .env.example .env
# set environmental variables in .env
./install.sh
```

The above command will create the following environment

- namespace
- scaledjob

## Uninstall

To uninstall use the same yaml files i opposite order

```
cd scripts
./uninstall.sh
```

## Notes

For processing night time light data of 6 January 2024, it took around 12 minutes time with 20GB RAM allocated pod. `activeDeadlineSeconds` is set to 3600 seconds (1 hour). Thus, the container will automatically stop after 1 hour passes. If the job finished before 1 hour, the container will automatically stop and delete it.

This scaled job is deployed to `manual` node pool which can autoscale up to 2 nodes. Currently, all pods for titiler and titiler-dev can run within a node. When a message is added into the queue, the resource is not enough to launch scaled job. Then k8s will scale up to 2 nodes. Once the pipeline job finished, the second node will be deleted automatically after some time (probably around 15 - 20 minutes).
