# UNDP GeoHub

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## Repositories managed

| App                              | Language   | Library   | NPM                                                                            | Source code                                                   |
| -------------------------------- | ---------- | --------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| GeoHub                           | TypeScript | sveltekit |                                                                                | [sites/geohub](./sites/geohub/)                               |
| @undp-data/electricity-dashboard | TypeScript | sveltekit | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/electricity-dashboard) | [apps/electricity-dashboard](./apps/electricity-dashboard/)   |
| @undp-data/current-location      | TypeScript | sveltekit | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/current-location)      | [packages/current-location](./packages/current-location/)     |
| @undp-data/style-switcher        | TypeScript | sveltekit | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/style-switcher)        | [packages/style-switcher](./packages/style-switcher/)         |
| @undp-data/style-viewer          | TypeScript | sveltekit | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/style-viewer)          | [packages/style-viewer](./packages/style-viewer/)             |
| @undp-data/svelte-undp-design    | TypeScript | sveltekit | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/svelte-undp-design)    | [packages/svelte-undp-design](./packages/svelte-undp-design/) |
| @undp-data/geohub-cli            | TypeScript | -         | ![npm (scoped)](https://img.shields.io/npm/v/@undp-data/geohub-cli)            | [packages/geohub-cli](./packages/geohub-cli/)                 |
| Documentation                    | Python     | mkdocs    |                                                                                | [documentation](./documentation/)                             |

## GeoHub Ecosystem

- Sequence diagram

```mermaid
sequenceDiagram
    autonumber
    actor user
    actor developer
    participant cli
    participant client
    participant maplibre
    participant server
    participant titiler
    participant blob as Azure Blob
    participant martin
    participant pg as pg_tileserv
    participant mspc as Microsoft PC
    participant db as PostGIS

    developer->>+cli: execute geohub-cli
    loop Scan datasets
        blob->>cli: scan datasets on blob containers
        martin->>cli: scan datasets on martin
        pg->>cli: scan datasets on pg_tileserv
        mspc->>cli: scan datasets on Microsoft PC
    end
    cli->>db: register datasets
    cli->>-developer: report completion of registration

    user->>client: open GeoHub
    alt is style parameter in URL
        client->>+server: /style - request style info
        server->>db: get style.json from PostGIS
        server->>-client: return style data
    else default
        client->>client: initialise
    end

    user->>client: search datasets
    client->>+server: /datasets - search datasets
    server->>db: search
    db->>server: return datasets
    server->>-client: return datasets as GeoJSON

    user->>+client: add datasets to map
    client->>+server: /vector/{source}/metadata.json
    server->>server: compute metadata
    server->>-client: return metadata.json

    client->>+server: /vector/{source}/tile.json
    server->>server: compute tile
    server->>-client: return tile.json

    client->>maplibre: add layer in source
    maplibre->>blob: request pbf
    maplibre->>martin: request pbf
    martin->>db: get pbf from PostGIS
    maplibre->>pg: request pbf
    pg->>db: get pbf from PostGIS
    maplibre->>+titiler: request raster tiles
    titiler->>blob: read COG
    titiler->>-maplibre: return png
    maplibre->>maplibre: render map

    client->>-user: provide rendered map

    user->>client: operate to save map
    maplibre->>client: style.json
    client->>+server: /style - save style.json
    server->>db: store style data
    server->>-client: return style ID
    user->>client: close GeoHub
```

the diagram was created by [mermaid online editor](https://mermaid.live/edit). Please read syntax of mermaid from the [documentation](https://mermaid.js.org/syntax/sequenceDiagram.htm)

- related repositories
  - [style](https://github.com/UNDP-Data/style): manage maplibre style.json for Geohub
  - [geohub-azure-functions](https://github.com/UNDP-Data/geohub-azure-functions): manage to deploy Azure Funcitons for Geohub
  - [kubexp](https://github.com/UNDP-Data/kubexp): manage configuration files to deploy titiler, martin and pg_tileserv to Azure Kubernetes

## Contributing

Please refer to [CONTRIBUTING.MD](./CONTRIBUTING.md) for more information about developing GeoHub.

## Release packages

- create release note by the following command

```
pnpm changeset
```

- create new PR to merge to develop branch
- changeset will create new PR to release packages
- changeset will release packages once the PR is merged to develop
