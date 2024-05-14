FROM node:20 as build

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_FRONTEND=dialog

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
ARG AZURE_AD_B2C_TENANT_ID
ARG AZURE_AD_B2C_CLIENT_ID
ARG AZURE_AD_B2C_CLIENT_SECRET
ARG AZURE_AD_B2C_APP_NAME
ARG GEOHUB_GITHUB_ID
ARG GEOHUB_GITHUB_SECRET
ARG AZURE_PUBSUB_CONNECTIONSTRING
ARG AZURE_PUBSUB_GROUP_DATA_PIPELINE
ARG JWT_SECRET_KEY
ARG GEOHUB_STATIC_IMAGE_API
ARG GEOHUB_DOCS_ENDPOINT
ARG SVELTE_UNDP_DESIGN_ENDPOINT
ARG SVELTE_UNDP_COMPONENTS_ENDPOINT
ARG MAPTILER_API_KEY

RUN npm install pnpm -g

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY packages/current-location/package.json packages/current-location/package.json
COPY packages/geohub-cli/package.json packages/geohub-cli/package.json
COPY packages/style-switcher/package.json packages/style-switcher/package.json
COPY packages/svelte-undp-design/package.json packages/svelte-undp-design/package.json
COPY packages/undp-bulma/package.json packages/undp-bulma/package.json
COPY packages/cgaz-admin-tool/package.json packages/cgaz-admin-tool/package.json
COPY packages/copy-to-clipboard/package.json packages/copy-to-clipboard/package.json 
COPY packages/svelte-static-image-controls/package.json packages/svelte-static-image-controls/package.json
COPY packages/svelte-sidebar/package.json packages/svelte-sidebar/package.json
COPY packages/svelte-maplibre-storymap/package.json packages/svelte-maplibre-storymap/package.json 
COPY packages/svelte-undp-components/package.json packages/svelte-undp-components/package.json
COPY sites/geohub/package.json sites/geohub/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 5173

CMD ["/bin/bash"]