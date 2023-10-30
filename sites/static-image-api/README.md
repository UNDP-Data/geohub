# geohub-static-image-api

This repository is to manage the code for static image API in GeoHub.

## Development

This repo is excluded from pnpm monorepo because the building process is too complicated. It uses standard npm package and you should install dependencies with the below command.

```
npm install
```

Then, launch local dev server as following command.

```
npm run dev
```

## Build

```
npm run build
```

To build maplibre-native and sharp packages, some dependencies are need to setup. See the [Dockerfile](./Dockerfile) for these settings.

## Deploy

CI will build and deploy new Docker image to Azure Container Registry automatically. Then App Service will pull the latest image.
