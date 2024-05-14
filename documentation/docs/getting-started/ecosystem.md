---
title: GeoHub Ecosystem
---

# GeoHub Ecosystem

---

Geohub ecosystem consists of various FOSS4G software in both frontend and backend side as shown in the below figure.

![Ecosystem of UNDP GeoHub](../assets/get-started/geohub.svg)

<!-- .element style="height: 500px" -->

---

In the backend side, the following servers are deployed in Azure Kubernetes (AKS) and AppService to provide advanced visualisation and analysis for users.

- [PostgreSQL/PostGIS](https://postgis.net/)
- [Titiler (cogserver)](https://github.com/UNDP-Data/geo-cogserver)
- [pg_tileserv](https://github.com/CrunchyData/pg_tileserv)
- [Maplibre Native (GeoHub Static Image API)](https://github.com/UNDP-Data/geohub/tree/develop/sites/static-image-api)
- [GeoHub Data Pipeline](https://github.com/UNDP-Data/geohub-data-pipeline)
- [UNDP STAC Data Pipeline](https://github.com/UNDP-Data/geo-undpstac-pipeline)

---

In the frontend side, the following libraries are used in [svelte/svelte-kit](https://kit.svelte.dev/).

- [Maplibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Bulma CSS](https://bulma.io/) - customized [undp-bulma](https://github.com/UNDP-Data/geohub/tree/develop/packages/undp-bulma)
- [UNDP Design System](https://design.undp.org/)
- and many open source softwares listed [here](https://geohub.data.undp.org/license)!

---

All source code is published in [Github](https://github.com/UNDP-Data/geohub?tab=readme-ov-file) with an open-source license.
