include sites/geohub/.env

.PHONY: help clean install build dev docker-build docker-up docker-prod docker-prod-build docker-prod-run

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  clean             to clean repository"
	@echo "  install           to install npm packages"
	@echo "  build             to install npm packages and build"
	@echo "  dev               to run dev server for GeoHub"
	@echo "  docker-build      to build Docker image for dev mode"
	@echo "  docker-up         to run Docker image in dev mode"
	@echo "  docker-down       to destroy Docker container in dev mode"
	@echo "  docker-prod       to build and run production Docker image"
	@echo "  docker-prod-build to build production Docker image"
	@echo "  docker-prod-run   to run production Docker image"

clean:
	rm -rf `find . -type d -name node_modules`
	rm -rf `find . -type d -name .svelte-kit`
	rm -rf `find . -type d -name build`
	rm -rf `find . -type d -name coverage`
	rm -rf `find . -type d -name .turbo`
	find . -type d -name dist ! -path "./documentation/*/dist" -exec rm -rf {} +
	rm -rf `find . -type d -name package`

install:
	make clean
	pnpm i

build:
	make install
	pnpm build

dev:
	pnpm --filter="./sites/geohub" dev

docker-build:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Building dev Docker image"
	@echo "------------------------------------------------------------------"
	docker compose -f docker/docker-compose.yml build

docker-up:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in dev mode"
	@echo "------------------------------------------------------------------"
	docker compose -f docker/docker-compose.yml up

docker-down:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Destroy docker containers"
	@echo "------------------------------------------------------------------"
	docker compose -f docker/docker-compose.yml down

shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Shelling in dev mode"
	@echo "------------------------------------------------------------------"
	docker compose -f docker/docker-compose.yml exec geohub /bin/bash

docker-prod: docker-prod-build docke-prod-run
	
docker-prod-build:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Building prod Docker image"
	@echo "------------------------------------------------------------------"
	./docker/docker-build-prod.sh

docker-prod-run:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running prod Docker image"
	@echo "------------------------------------------------------------------"
	./docker/docker-run-prod.sh