# NodeJS 18 setup modified from standard NodeJS bullseye-slim installation
# borrow Dockerfile from https://github.com/consbio/mbgl-renderer/blob/main/docker/Dockerfile
# https://github.com/maplibre/maplibre-native/discussions/1091
FROM ubuntu:22.04 as build
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_VERSION=22

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

WORKDIR /app/src

COPY package*.json /app/src

RUN npm install -g npm
RUN npm ci

COPY .  /app/src/.

RUN npm run build
RUN cp package*.json /app/src/build && \
    cp entrypoint.sh /app/src/build
WORKDIR /app/src/build
RUN npm install --omit=dev
WORKDIR /app
RUN mv /app/src/build/* /app/.
RUN rm -rf /app/src

ENV DISPLAY=:99
EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
