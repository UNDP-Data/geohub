FROM --platform=linux/amd64 node:18 as build

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt install -y --no-install-recommends \
    python3 \
    python3-pip

ENV DEBIAN_FRONTEND=dialog

RUN npm install pnpm -g

# Create app directory
WORKDIR /app

COPY . .

# Build mkdocs documentation
WORKDIR /app/documentation
RUN PATH="/usr/local/bin/pipenv:$PATH"
RUN export PATH
RUN pip install pipenv
RUN pipenv install --system
RUN mkdocs build

WORKDIR /app

# disable shared lockfile
RUN echo "shared-workspace-lockfile = false" >> .npmrc
RUN pnpm install

WORKDIR /app/sites/geohub

# build Geohub source code
RUN pnpm build
# delete node_modules with devDependencies and install only dependencies packages
RUN rm -rf node_modules
RUN pnpm --filter="." install --prod
# copy necessary files to build folder
RUN cp package.json build/.
RUN cp pm2.json build/.
RUN mv node_modules build/.

# production image
FROM node:18-alpine

WORKDIR /geohub
# copy build folder from build image
COPY --from=build /app/sites/geohub/build /geohub

# install pm2
RUN npm i -g pm2

EXPOSE 3000

# rum pm2 cluster with maximum 4 instances
# https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#pm2-runtime-helper
CMD ["pm2-runtime", "index.js", "-i", "4"]
