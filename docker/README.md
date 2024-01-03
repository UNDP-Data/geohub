# development in Docker

## Usage

- Copy `.env.docker.example` to `.env` under `sites/geohub` folder

```shell
cd sites/geohub
cp .env.docker.example .env
cd ../..
```

also, copy .env to `docker` folder for the database connection string for pg_tileserv

```shell
cp sites/geohub/.env docker/.env
```

- build docker image for dev mode

```shell
make docker-build
```

- run docker image in dev mode

```shell
make docker-up
```

The following backend services will be launched in docker.

- titiler: http://localhost:8000
- pgtileserv: http://localhost:7800
- static API: http://localhost:9000

Then, open another terminal to launch sveltekit by the following command at root folder of the repository.

```shell
make build # for first time or you have changed anything under packages
make dev
```

note. make sure you configure URLs for titiler, pgtilserv and static API in `.env` file

- test production environment

if you want to test GeoHub in production environment, the following commands can allow you to do it. This command will build Docker image with exactly same way to deploy to Azure App Service.

```shell
make docker-prod-build
make docker-prod-run
```

You can access it via `http:localhost:3000`.
