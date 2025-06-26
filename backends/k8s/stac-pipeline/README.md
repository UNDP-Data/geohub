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

## Delete old jobs

In some reason, old jobs are not deleted, and it maybe blocks to trigger new scaled job.

```shell
kubectl get all -n stac
NAME                                   COMPLETIONS   DURATION   AGE
job.batch/stac-scaled-cron-job-27db6   1/1           2m22s      50d
job.batch/stac-scaled-cron-job-2jmn4   1/1           2m21s      29d
job.batch/stac-scaled-cron-job-2p8l5   1/1           2m10s      62d
job.batch/stac-scaled-cron-job-45b56   1/1           2m33s      9d
job.batch/stac-scaled-cron-job-45gvv   1/1           2m14s      56d
job.batch/stac-scaled-cron-job-4chfd   1/1           2m5s       84d
job.batch/stac-scaled-cron-job-4dhxj   1/1           2m7s       6d7h
```

In this case, you may need to delete jobs manually by using the below command.

```shell
# delete all jobs in stac namespace
kubectl delete jobs -n stac --all
# delete all completed jobs in stac namespace
kubectl delete jobs -n stac --field-selector=status.successful=1
```

To avoid this issue, I added the below setting for scaled cron job.

```yaml
spec:
  jobTargetRef:
    # delete job after 3600 seconds (1 hour) of completion
    ttlSecondsAfterFinished: 3600
  successfulJobsHistoryLimit: 0 # Don't keep successful jobs
  failedJobsHistoryLimit: 10 # keep failed jobs for 10 attempts
```
