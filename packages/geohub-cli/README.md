# geohub-cli

This repository is to manage CLI tools for geohub

## Usage

```shell
$geohub -h
Usage: geohub [options] [command]

Options:
  -v, --version     output the version number
  -h, --help        display help for command

Commands:
  martin [options]  scan martin layers to register metadata into PostgreSQL database.
  stac [options]    scan STAC collections to register metadata into PostgreSQL database.
  help [command]    display help for command
```

- Register martin layers

```shell
$geohub martin -h
Usage: geohub martin [options]

scan martin layers to register metadata into PostgreSQL database.

Options:
  -d, --database <dsn>           PostgreSQL database connection string
  -m, --martin-url [martin-url]  URL for martin index.json (default: "https://martin.undpgeohub.org/index.json")
  -o, --output [output]          Output directory for temporary working folder (default: "tmp")
  -h, --help                     display help for command
```

- Register STAC collections

```shell
$geohub stac -h
Usage: geohub stac [options]

scan STAC collections to register metadata into PostgreSQL database.

Options:
  -d, --database <dsn>   PostgreSQL database connection string
  -s, --stac <stac>      STAC API root URL. e.g., https://planetarycomputer.microsoft.com/api/stac/v1
  -o, --output [output]  Output directory for temporary working folder (default: "tmp")
  -h, --help             display help for command
```

For example

```shell
# to register STAC by Microsoft Planetary Computer
geohub stac -d <database connection string> -s https://planetarycomputer.microsoft.com/api/stac/v1

# to register STAC by Earth Search
geohub stac -d <database connection string> -s https://earth-search.aws.element84.com/v0/
```
