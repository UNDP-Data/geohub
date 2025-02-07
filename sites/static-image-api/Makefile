.PHONY: help clean install build dev dockerbuild dockerrun

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  clean       to clean repository"
	@echo "  install     to install npm packages and build"
	@echo "  dev         to run dev server for GeoHub"
	@echo "  build       to build Docker image"
	@echo "  up	         to run Docker image"
	@echo "  down        to destroy docker containers"
	@echo "  shell       to shell in dev mode"

clean:
	rm -rf `find . -type d -name node_modules`
	rm -rf `find . -type d -name .svelte-kit`
	rm -rf `find . -type d -name build`

install:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Install packages and build application"
	@echo "------------------------------------------------------------------"
	make clean
	npm install
	npm run build

dev:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Launch application in localhost"
	@echo "------------------------------------------------------------------"
	npm run dev

build:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Building Docker image"
	@echo "------------------------------------------------------------------"
	docker compose -f docker-compose.yml build

up:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Launch docker containers"
	@echo "------------------------------------------------------------------"
	docker compose -f docker-compose.yml up

down:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Destroy docker containers"
	@echo "------------------------------------------------------------------"
	docker compose -f docker-compose.yml down

shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Shelling in dev mode"
	@echo "------------------------------------------------------------------"
	docker compose -f docker-compose.yml run --remove-orphans --entrypoint /bin/bash static_image_api