# Vector tiles and dynamic vector layers with pg_tileserv

[pg_tileserv](https://github.com/CrunchyData/pg_tileserv) is a PostGIS based dynamic vector tile server written in golang
capable to serve postgis layers as vector tiles. Additinally it supports invoking SQL functions as vector tile layers. The server connects to a PostGIS DB through $DATABASE_URL env variable representing postgres connection string. The server can use a TOML config as an alternative to its defaults.

- [Namespace](#namespace)
- [Installation](#installation)
  - [deployment](#deployment)
  - [service](#service)
  - [ingress](#ingress)
- [Uninstall](#uninstall)
- [Automatic setup](#automatic-setup)
- [Config](#config)
- [Use case](#use-case)

## Namespace

The server lives in its namespace: **pgtileserv** and features 2 replicasets

```
    kubectl apply -f yaml/pgtileserv-namespace.yaml

```

## Installation

### deployment

```
kubectl apply -f yaml/pgtileserv-deployment.yaml
```

### service

```
kubectl apply -f yaml/pgtileserv-service.yaml
```

### ingress

```
kubectl apply -f yaml/pgtileserv-ingress.yaml
```

## Uninstall

To uninstall use the same yaml files i opposite order

```
kubectl delete -f yaml/pgtileserv-ingress.yaml
kubectl delete -f yaml/pgtileserv-service.yaml
kubectl delete -f yaml/pgtileserv-deployment.yaml
kubectl delete -f yaml/pgtileserv-namespace.yaml
```

## Automatic setup

The [scripts](./scripts/) folder contains bash scripts that can
install/uninstall the server and its associated resources provided they are invoked from current directory

## Config

## Use case
