# UNDP GeoHub

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## Repositories managed

| App                           | Language   | Library   | Source code                                                   |
| ----------------------------- | ---------- | --------- | ------------------------------------------------------------- |
| GeoHub                        | TypeScript | sveltekit | [sites/geohub](./sites/geohub/)                               |
| Electricity dashboard         | TypeScript | sveltekit | [apps/electricity-dashboard](./apps/electricity-dashboard/)   |
| @undp-data/current-location   | TypeScript | sveltekit | [packages/current-location](./packages/current-location/)     |
| @undp-data/style-switcher     | TypeScript | sveltekit | [packages/style-switcher](./packages/style-switcher/)         |
| @undp-data/style-viewer       | TypeScript | sveltekit | [packages/style-viewer](./packages/style-viewer/)             |
| @undp-data/svelte-undp-design | TypeScript | sveltekit | [packages/svelte-undp-design](./packages/svelte-undp-design/) |
| @undp-data/geohub-cli         | TypeScript | -         | [packages/geohub-cli](./packages/geohub-cli/)                 |
| Documentation                 | Python     | mkdocs    | [documentation](./documentation/)                             |

## Development

You can operate multiple packages at once by filtering as follows.

```bash
pnpm --filter="./sites/*" install
pnpm --filter="./sites/*" update
pnpm --filter="./sites/*" lint
pnpm --filter="./sites/*" format
pnpm --filter="./sites/*" build
```

Or, just simpley to move current directory to continue develop

```bash
cd sites/geohub
pnpm i
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
