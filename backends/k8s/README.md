# GeoHub kubernetes setup

## [titiler](./titiler/)

- titiler
  - depl
    - 3 replicaset
    - 2 GB
    - 1 CPU
  - serv
  - ingress
    - titiler.undpgeohub.org

## [titiler-dev](./titiler-dev/)

- titiler
  - pod
    - 1 replicaset
    - 2 GB RAM
    - 1 CPU
  - serv
  - ingress
    - titiler-dev.undpgeohub.org

## [pgtileserv](./pgtileserv/)

- pgtileserv
  - depl
    - 2 replicaset
    - 2 GB
      -1 CPU
  - serv
  - ingress
  - pgtileserv.undpgeohub.org

## [martin](https://github.com/UNDP-Data/kubexp/tree/main/martin)

Not in use currently

- martin-dev
  - martin
    - pod
      - 1 replicaset
      - 2 GB
      - 1 CPU
    - serv
    - ingress
      - martin-dev.undpgeohub.org

## [cert-manager](./cert-manager/)

- deployed using ymal from github cert-manager repo
- v 1.9.0
- clusterissuer - available in all namespaces
  - letsencrypt
  - cloudflare for DNS

## ingress-nginx controller

    - comes wuith the cluster (installed)
    - nginx MS flavour

## cloudflare

    - undpgeohub.org
        - our domain
        - we use this to allocated subdomains
        - because IT is slow

All services are acccessed through ingress

TODO

Geoserver - move to out cluster
