include sites/geohub/.env

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
	rm -rf `find . -type d -name coverage`
	rm -rf `find . -type d -name .turbo`
	rm -rf `find . -type d -name dist`
	rm -rf `find . -type d -name package`

install:
	make clean
	pnpm i

build:
	make install
	pnpm build

dev:
	pnpm --filter="./sites/geohub" dev

dockerbuild:
	./docker-build.sh

dockerrun:
	./docker-run.sh