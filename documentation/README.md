# geohub-docs

Documentation for Geohub - UNDP's one stop shop for spatial data and analytics

## Documentation process

### Edit your own markdown

all markdown files should be placed under `docs` folder. You can also put any images under `images` folder.

after putting your markdown file, open `mkdocs.yml` and edit `nav` section to link your file to navigation menu.

### Testing your changes on your local machine via Docker

The best experience of documenting is to use docker-compose. The steps are as follows.

1. Clone this repository: git clone https://github.com/UNDP-Data/geohub
1. Move to documentation folder: `cd documentation`
1. Copy `.env.example` to `.env`: `cp .env.example .env`
1. Run it: `docker-compose up --build`
1. Point your browser to the serving endpoint at http://localhost:8000.

The server will automatically live-reload with any change made to the local `./docs` directory.

If you want to change the port number exposed, change it in `.env` file. As default, the server will be launched at the port `8000` (There might be conflict with titiler).

### Testing your changes on your local machine

```bash
pip install pipenv
pipenv install -r requirements.txt
python generate-slides.py
pipenv run mkdocs serve
```

### Building documentation

To run build mkdocs, SITE_URL environmental variable needs to be configured in advance. SITE_URL must be URL for production server.

```bash
pipenv shell
export SITE_URL=https://docs.undpgeohub.org
python generate-slides.py
mkdocs build
```

The build output is available at `./site` inside of the container.

### generating slides from markdown

`generate-slides.py` will copy markdown files except assets and slides folders to create slide markdown files (`*_slide.md`) for reveal.js. Before building, make sure run `python generate-slides.py` to update slides.

#### Special tags to be removed for slides

the following elements and string will be removed for slides:

- `<hr>` elements converted from `---`
- `<p>--</p>` elements converted from `--`
- remove strings matches `{:style="[^"]*"\}`
- If a content is wrapped by `<hidden></hidden>` tag, it will not be shown in slides, but it is shown in web page.

#### Use of mermaid for both webpage and slides

mermaid plugin for mkdocs uses ```mermaid``` syntax, but this does not work with reveal.js, thus this docs is not using mermaid mkdocs plugin.

To include mermaid diagram, please wrap the conents by `<div class="mermaid">{mermaid text}</div>`. This will work for both web page and slides.