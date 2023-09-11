FROM node:18 as build

ENV DEBIAN_FRONTEND=noninteractive

ARG MARTIN_API_ENDPOINT
ARG PGTILESERV_API_ENDPOINT
ARG TITILER_ENDPOINT
ARG AZURE_STORAGE_ACCOUNT
ARG AZURE_STORAGE_ACCESS_KEY
ARG AZURE_STORAGE_ACCOUNT_UPLOAD
ARG AZURE_STORAGE_ACCESS_KEY_UPLOAD
ARG AZURE_SERVICE_BUS_CONNECTIONSTRING
ARG AZURE_SERVICE_BUS_QUEUE_NAME
ARG DATABASE_CONNECTION
ARG AUTH_SECRET
ARG AZURE_AD_TENANT_ID
ARG AZURE_AD_CLIENT_ID
ARG AZURE_AD_CLIENT_SECRET

RUN apt-get update
RUN apt-get install -y \
    build-essential \
    ccache \
    cmake \
    ninja-build \
    pkg-config \
    xvfb \
    libcurl4-openssl-dev \
    libglfw3-dev \
    libuv1-dev \
    libjpeg62-turbo \
    libpng-dev \
    libwebp-dev \
    libicu-dev
RUN update-ccache-symlinks

RUN npm install pnpm -g

# Create app directory
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY packages/current-location/package.json packages/current-location/package.json
COPY packages/geohub-cli/package.json packages/geohub-cli/package.json
COPY packages/style-switcher/package.json packages/style-switcher/package.json
COPY packages/style-viewer/package.json packages/style-viewer/package.json
COPY packages/svelte-undp-design/package.json packages/svelte-undp-design/package.json
COPY packages/undp-bulma/package.json packages/undp-bulma/package.json
COPY packages/cgaz-admin-tool/package.json packages/cgaz-admin-tool/package.json
COPY sites/geohub/package.json sites/geohub/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

WORKDIR /app/sites/geohub

# delete node_modules with devDependencies and install only dependencies packages
RUN rm -rf node_modules
RUN sed -e 's/workspace://g' ./package.json > ./package2.json
RUN rm package.json
RUN mv package2.json package.json
RUN npm install --omit=dev --legacy-peer-deps
RUN cp package.json build/.
RUN mv node_modules build/.

FROM keymetrics/pm2:18-slim

WORKDIR /geohub
# copy build folder from build image
COPY --from=build /app/sites/geohub/build /geohub

EXPOSE 3000

# rum pm2 cluster with maximum 4 instances
# https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#pm2-runtime-helper
CMD ["pm2-runtime", "index.js", "-i", "4"]
