# NodeJS 18 setup modified from standard NodeJS bullseye-slim installation
# borrow Dockerfile from https://github.com/consbio/mbgl-renderer/blob/main/docker/Dockerfile
# https://github.com/maplibre/maplibre-native/discussions/1091
FROM --platform=linux/amd64 node:18-bullseye as build
ENV DEBIAN_FRONTEND noninteractive

# https://github.com/maplibre/maplibre-native/tree/main/platform/linux#prerequisites
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    ccache \
    cmake \
    ninja-build \
    pkg-config \
    libcurl4-openssl-dev \
    libglfw3-dev \
    libuv1-dev \
    libjpeg62-turbo \
    libpng-dev \
    libwebp-dev \
    libicu-dev \
    libcairo2-dev \
    libgles2-mesa-dev \
    libgbm-dev  \
    xvfb \
    x11-utils

RUN dpkgArch="$(dpkg --print-architecture)" && \
  # install deps required by maplibre-gl-native but not available on bullseye
  wget --no-verbose http://snapshot.debian.org/archive/debian/20190501T215844Z/pool/main/g/glibc/multiarch-support_2.28-10_$dpkgArch.deb && \
  apt install ./multiarch-support_2.28-10_$dpkgArch.deb && \
  wget --no-verbose http://snapshot.debian.org/archive/debian/20141009T042436Z/pool/main/libj/libjpeg8/libjpeg8_8d1-2_$dpkgArch.deb && \
  apt install ./libjpeg8_8d1-2_$dpkgArch.deb && \
  if [ "$dpkgArch" = "arm64" ] ; then \
  wget --no-verbose http://ports.ubuntu.com/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_arm64.deb ; else \
  wget --no-verbose http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_amd64.deb ;\
  fi && \
  apt install ./libicu66_66.1-2ubuntu2.1_$dpkgArch.deb && \
  rm -rf *.deb

WORKDIR /app

RUN npm install -g npm
COPY package*.json /app/

RUN npm ci

COPY . /app/.

RUN npm run build
RUN rm -rf node_modules
RUN npm install --omit=dev
RUN cp package.json build/.
RUN mv node_modules build/.

RUN cp entrypoint.sh ./build/.

FROM node:18-bullseye

RUN apt update
RUN apt install -y \
    libcurl4-openssl-dev \
    libglfw3-dev \
    libuv1-dev \
    libjpeg62-turbo \
    libpng-dev \
    libwebp-dev \
    libicu-dev \
    libcairo2-dev \
    libgles2-mesa-dev \
    libgbm-dev \
    tzdata \
    xvfb \
    libopengl-dev \
    libuv1-dev
RUN dpkgArch="$(dpkg --print-architecture)" && \
  # install deps required by maplibre-gl-native but not available on bullseye
  wget --no-verbose http://snapshot.debian.org/archive/debian/20190501T215844Z/pool/main/g/glibc/multiarch-support_2.28-10_$dpkgArch.deb && \
  apt install ./multiarch-support_2.28-10_$dpkgArch.deb && \
  wget --no-verbose http://snapshot.debian.org/archive/debian/20141009T042436Z/pool/main/libj/libjpeg8/libjpeg8_8d1-2_$dpkgArch.deb && \
  apt install ./libjpeg8_8d1-2_$dpkgArch.deb && \
  if [ "$dpkgArch" = "arm64" ] ; then \
  wget --no-verbose http://ports.ubuntu.com/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_arm64.deb ; else \
  wget --no-verbose http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_amd64.deb ;\
  fi && \
  apt install ./libicu66_66.1-2ubuntu2.1_$dpkgArch.deb && \
  rm -rf *.deb

WORKDIR /app
COPY --from=build /app/build /app

RUN npm i -g pm2

ENV DISPLAY=:99
EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
