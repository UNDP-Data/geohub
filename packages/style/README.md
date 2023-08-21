# @undp-data/style

## Install

```shell
pnpm i
```

### M1 Mac

If you are using M1 Mac, sprite-zero cannot be installed in normal nodejs, so please install nodejs by using NVM as following commands.

```shell
$nvm uninstall 18
$arch -x86_64 zsh
$nvm install 18
$nvm alias default 18
```

## Build style.json

```shell
pnpm build:style
pnpm build:aerialstyle
```

## Develop style.json

- launch preview for OSM style

```shell
pnpm serve
```

- launch preview for Bing aerial style

```shell
pnpm serve:aerial
```

## Build sprite

```shell
pnpm build:sprite
```

## License

The license of OSM style belong to CARTO. See [License](./LICENSE).

The license of source code is MIT license.
