.PHONY: help clean install build dev dockerbuild dockerrun

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  clean       to clean repository"
	@echo "  install     to install npm packages"
	@echo "  build       to install npm packages and build"
	@echo "  dev         to run dev server for GeoHub"
	@echo "  dockerbuild to build Docker image"
	@echo "  dockerrun   to run Docker image"

clean:
	rm -rf `find . -type d -name node_modules`
	rm -rf `find . -type d -name .svelte-kit`
	rm -rf `find . -type d -name build`

install:
	make clean
	npm install

build:
	make install
	npm run build

dev:
	npm run dev

dockerbuild:
	docker compose build

dockerrun:
	docker compose up