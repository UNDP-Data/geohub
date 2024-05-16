# NodeJS 18 setup modified from standard NodeJS bullseye-slim installation
# borrow Dockerfile from https://github.com/consbio/mbgl-renderer/blob/main/docker/Dockerfile
# https://github.com/maplibre/maplibre-native/discussions/1091
FROM --platform=linux/amd64 ubuntu:22.04 as build
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_VERSION=20

# https://github.com/maplibre/maplibre-native/tree/main/platform/linux#prerequisites
RUN apt-get update
RUN apt-get install -y \
    curl \
    libcurl4-openssl-dev \
    libglfw3-dev \
    libuv1-dev \
    libpng-dev \
    libicu-dev \
    libjpeg-turbo8-dev \
    libwebp-dev \
    clang \
    cmake \
    ccache \
    ninja-build \
    pkg-config \
    xvfb \
    x11-utils

RUN curl -Ls https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash
RUN apt-get update && apt-get install -y nodejs

WORKDIR /app/tmp

COPY package*.json /app/

RUN npm ci

COPY .  /app/tmp/.

RUN npm run build
RUN rm -rf node_modules
RUN npm install --omit=dev
RUN cp package.json build/.
RUN mv node_modules build/.

RUN cp entrypoint.sh ./build/.

RUN cp -r /app/tmp/build/. /app/.
RUN rm -rf /app/tmp/build

WORKDIR /app

COPY entrypoint.sh /app/entrypoint.sh

ENV DISPLAY=:99
EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
