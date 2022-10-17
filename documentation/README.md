# geohub-docs

Documentation for Geohub - UNDP's one stop shop for spatial data and analytics

## Documentation process

### Edit your own markdown

all markdown files should be placed under `docs` folder. You can also put any images under `images` folder.

after putting your markdown file, open `mkdocs.yml` and edit `nav` section to link your file to navigation menu.

### Testing your changes on your local machine

```bash
pipenv install
pipenv run serve
```

### Testing your changes on your local machine via Docker

1. Clone this repository: git clone https://github.com/UNDP-Data/geohub
1. Move to documentation folder: `cd documentation`
1. Build the container: `docker build . -t geohub-docs`
1. Run it: `docker run -it -v ${PWD}:/opt/app -p 8000:8000 geohub-docs`
1. Point your browser to the serving endpoint at http://localhost:8000.

The server will automatically live-reload with any change made to the local `./docs` directory.

### Building documentation

```bash
pipenv run build
```

The build output is available at `./site` inside of the container.
