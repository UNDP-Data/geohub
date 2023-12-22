# development in Docker

## Usage

- Copy `.env.example` to `.env` under docker folder

```shell
cd docker
cp .env.example .env
cd ..
```

- build docker image for dev mode

```shell
make docker-build
```

- run docker image in dev mode

```shell
make docker-up
```

You can access GeoHub locally through `http://localhost:5173`.

- test production environment

if you want to test GeoHub in production environment, the following commands can allow you to do it. This command will build Docker image with exactly same way to deploy to Azure App Service.

```shell
make docker-prod-build
make docker-prod-run
```

You can access it via `http:localhost:3000`.
