# NodeJS 18 setup modified from standard NodeJS bullseye-slim installation
# borrow Dockerfile from https://github.com/consbio/mbgl-renderer/blob/main/docker/Dockerfile
# https://github.com/maplibre/maplibre-native/discussions/1091
FROM ubuntu:24.04 AS build
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=22

# https://github.com/maplibre/maplibre-native/tree/main/platform/linux#prerequisites
RUN apt-get update && apt-get install -y \
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
    x11-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
    
RUN curl -Ls https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash && \
    apt-get update && apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/src

COPY package*.json ./

RUN npm ci

COPY .  .

RUN npm run build && \
    cp package*.json entrypoint.sh /app/src/build/ && \
    npm ci --omit=dev --prefix /app/src/build && \
    mv /app/src/build/* /app/. && \
    rm -rf /app/src

WORKDIR /app
ENV DISPLAY=:99
EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
