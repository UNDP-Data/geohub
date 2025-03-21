# UNDP GeoHub

![GitHub](https://img.shields.io/github/license/undp-data/geohub)
![GitHub repo size](https://img.shields.io/github/repo-size/undp-data/geohub)
[![CIs](https://github.com/UNDP-Data/geohub/actions/workflows/ci.yml/badge.svg)](https://github.com/UNDP-Data/geohub/actions/workflows/ci.yml)

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## GeoHub Ecosystem

![geohub.svg](./documentation/docs/assets/get-started/geohub.svg)

More details diagrams about GeoHub system architecture are available at [documentation/DIAGRAMS.md](./documentation/DIAGRAMS.md)

### Repositories managed in this monorepo

| App / Packages                                                                             | Changelog                                                         |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [GeoHub](./sites/geohub/)                                                                  | [Changelog](./sites/geohub/CHANGELOG.md)                          |
| [GeoHub Static Image API](./sites/static-image-api/)                                       | n/a                                                               |
| [Azure Kubernetes Deployment](./backends/k8s/)                                             | n/a                                                               |
| [Documentation](./documentation/)                                                          | n/a                                                               |
| [@undp-data/cgaz-admin-tool](./packages/cgaz-admin-tool/)                                  | [Changelog](./packages/cgaz-admin-tool/CHANGELOG.md)              |
| [@undp-data/style-switcher](./packages/style-switcher/)                                    | [Changelog](./packages/style-switcher/CHANGELOG.md)               |
| [@undp-data/undp-bulma](./packages/undp-bulma/)                                            | [Changelog](./packages/undp-bulma/CHANGELOG.md)                   |
| [@undp-data/svelte-geohub-static-image-controls](./packages/svelte-static-image-controls/) | [Changelog](./packages/svelte-static-image-controls/CHANGELOG.md) |
| [@undp-data/svelte-undp-design](./packages/svelte-undp-design/)                            | [Changelog](./packages/svelte-undp-design/CHANGELOG.md)           |
| [@undp-data/svelte-undp-components](./packages/svelte-undp-components/)                    | [Changelog](./packages/svelte-undp-components/CHANGELOG.md)       |

### Repositories developed for GeoHub

| Repository                                                                  | Description                                                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [style](https://github.com/UNDP-Data/style)                                 | hosts maplibre style.json for Geohub                               |
| [fonts](https://github.com/UNDP-Data/fonts)                                 | font glyph files for maplibre-gl-js                      |
| [pgsql](https://github.com/UNDP-Data/pgsql)                                 | PostgreSQL functions or dynamic layers for pg_tileserv                                    |
| [geohub-data-pipeline](https://github.com/UNDP-Data/geohub-data-pipeline)   | Data upload pipelines for GeoHub                                       |
| [geo-cogserver](https://github.com/UNDP-Data/geo-cogserver)                 | customised WMTS server.                                   |
| [geo-undpstac-pipeline](https://github.com/UNDP-Data/geo-undpstac-pipeline) | This project processes geospatial data from remote sources into UNDP STAC Catalog |

## Contributing

Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for more information about developing GeoHub.

## License

[BSD-3-Clause license](./LICENSE)
