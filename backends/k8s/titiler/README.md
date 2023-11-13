# WTMS+ layers and services with titiler

[titiler](https://github.com/developmentseed/titiler) is a set of python modules that focus on creating FastAPI application for dynamic tiling

- [Namespace](#namespace)
- [Installation](#installation)
- [Uninstall](#uninstall)
- [Automatic setup](#automatic-setup)
- [Config](#config)
- [Use case](#use-case)

## Namespace

The server lives in its namespace: **titiler** and features 2 replicasets

## Installation

```
kubectl apply -f yaml/titiler-deployment.yaml
```

The above command will create the following environment

- namespace
- deployment
- service
- ingress

## Uninstall

To uninstall use the same yaml files i opposite order

```
kubectl delete -f yaml/titiler-deployment.yaml
```

## Automatic setup

The [scripts](./scripts/) folder contains bash scripts that can
install/uninstall the server and its associated resources provided they are invoked from current directory

## Config

## Use case
