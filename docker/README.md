# development in Docker

## Usage

- Copy `.env.docker.example` to `.env` under `sites/geohub` folder

```shell
cd sites/geohub
cp .env.docker.example .env
cd ../..
```

Only `AZURE_STORAGE_ACCOUNT` and `AZURE_STORAGE_ACCESS_KEY` are not available in `.env.docker.example`, please ask these access keys to one of our geohub team to get access to our Azure Blob Storage account. Otherwise, geohub should be able to be launched locally with default secrets settings in example .env by using docker-compose.

also, copy .env to `docker` folder for the database connection string for pg_tileserv if you are going to connect to remote database server.

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
- PostGIS:
  - port=25432
  - user=docker
  - pass=docker

for the first time, you need to setup database table by the following command in another terminal. Password is `docker` if you have not changed from default.

```shell
# make sure you stop all containers
make docker-down
# remove volume for database
docker volume rm docker_database
# launch containers in docker-compose
make docker-up
```

Afterward, creating database by drizzle is required by following the below steps.

```shell
# move to geohub folder
cd sites/geohub

# please make sure DATABASE_CONNECTION in .env is pointing to Docker database.
vi .env

# migrate database schema to Docker
pnpm drizzle-kit:migrate

# back to the root folder of the repository
cd ../..
# insert initial data
./backends/database/init.sh
```

For drizzle settings, please refer to [CONTRIBUTING.md](https://github.com/UNDP-Data/geohub/tree/develop/sites)

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
