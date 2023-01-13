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

## Development

You can operate multiple packages at once by filtering as follows.

```bash
pnpm install
pnpm build
```

Or, just simply to move current directory to continue develop

```bash
cd sites/geohub
pnpm --filter="." i
pnpm dev
```

## Release packages

- create release note by the following command

```
pnpm changeset
```

- create new PR to merge to develop branch
- changeset will create new PR to release packages
- changeset will release packages once the PR is merged to develop
