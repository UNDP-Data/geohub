# UNDP GeoHub

GeoHub is a geospatial visualization data portal built by UNDP using [SvelteKit](https://kit.svelte.dev/).

## Repositories managed

|App|Language|Library|Source code|
|---|---|---|---|
|GeoHub|TypeScript|sveltekit|[sites/geohub](./sites/geohub/)|
|@undp-data/style-switcher|TypeScript|sveltekit|[packages/style-switcher](./packages/style-switcher/)|
|@undp-data/current-location|TypeScript|sveltekit|[packages/current-location](./packages/current-location/)|
|geohub-cli|TypeScript|-|[packages/geohub-cli](./packages/geohub-cli/)|
|Documentation|Python|mkdocs|[documentation](./documentation/)|

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
