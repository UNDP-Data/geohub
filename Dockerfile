FROM node:19 as build

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_FRONTEND=dialog

RUN npm install pnpm -g

# Create app directory
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY apps/electricity-dashboard/package.json apps/electricity-dashboard/package.json
COPY packages/current-location/package.json packages/current-location/package.json
COPY packages/geohub-cli/package.json packages/geohub-cli/package.json
COPY packages/style-switcher/package.json packages/style-switcher/package.json
COPY packages/style-viewer/package.json packages/style-viewer/package.json
COPY packages/svelte-undp-design/package.json packages/svelte-undp-design/package.json
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
RUN npm install --omit=dev
RUN cp package.json build/.
RUN mv node_modules build/.

# production image
FROM node:19-slim

WORKDIR /geohub
# copy build folder from build image
COPY --from=build /app/sites/geohub/build /geohub

# install pm2
RUN npm i -g pm2

EXPOSE 3000

# rum pm2 cluster with maximum 4 instances
# https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#pm2-runtime-helper
CMD ["pm2-runtime", "index.js", "-i", "4"]
