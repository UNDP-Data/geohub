# development in Docker

## Usage

- Copy `.env.example` to `.env` under `sites/geohub` folder

```shell
cd sites/geohub
cp .env.example .env
cd ../..
```

- build docker image for dev mode

```shell
make docker-build
```

- run docker image in dev mode

```shell
make docker-up
```

Backend services like titiler will be launched in docker.

Then, open another terminal to launch sveltekit by the following command at root folder of the repository.

```shell
make build # for first time or you have changed anything under packages
make dev
```

- test production environment

if you want to test GeoHub in production environment, the following commands can allow you to do it. This command will build Docker image with exactly same way to deploy to Azure App Service.

```shell
make docker-prod-build
make docker-prod-run
```

You can access it via `http:localhost:3000`.
