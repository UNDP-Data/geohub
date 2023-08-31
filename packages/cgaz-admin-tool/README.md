# @undp-data/cgaz-admin-tool

## Install

```shell
pnpm i -D @undp-data/cgaz-admin-tool
```

## Usage

```ts
import { MaplibreCgazAdminControl } from '@undp-data/cgaz-admin-tool';
import '@undp-data/cgaz-admin-tool/dist/AdminControl.css';

const options = {
	url: 'https://undpngddlsgeohubdev01.blob.core.windows.net/admin/cgaz-geoboundaries.pmtiles',
	attribution: `Administrative boundaries courtesy of <a href= 'https://www.geoboundaries.org'>geoBoundaries</a>`,
	isHover: true,
	sourceId: 'cgaz',
	layerId: 'cgaz',
	sourceLayer: 'admin',
	featureId: 'id',
	maxZoom: 10,
	adminRange: [0, 2],
	adminName: 'admin{level}_name'
};

map.addControl(new MaplibreCgazAdminControl(options), 'top-left');
```

In order to use this plugin, please also setup PMTiles Javascript API as follows.

```shell
pnpm i -D pmtiles
```

```ts
import maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
```

## Options

| Property    | Description                                                                    | Default                                                                                     |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| url         | URL for CGAZ PMTiles                                                           | [URL](https://undpngddlsgeohubdev01.blob.core.windows.net/admin/cgaz-geoboundaries.pmtiles) |
| attribution | Attribution for CGAZ                                                           | Administrative boundaries courtesy of [geoBoundaries](https://www.geoboundaries.org)        |
| isHover     | If true, hovering by feature ID will be enabled. Default is true.              | true                                                                                        |
| sourceId    | Source ID for maplibre.                                                        | cgaz                                                                                        |
| layerId     | layer ID for maplibre.                                                         | cgaz                                                                                        |
| sourceLayer | source-layer property value for maplibre.                                      | admin                                                                                       |
| featureId   | FeatureState ID.                                                               | id                                                                                          |
| maxZoom     | Max zoom level of CGAZ PMTiles.                                                | 10                                                                                          |
| adminRange  | Range of admin levels covered.                                                 | [0, 2] (level 0 to 2)                                                                       |
| adminName   | field name of administrative boundaries. {level} is replaced with admin level. | "admin{level}\_name".                                                                       |

## create-svelte

Everything you need to build a Svelte library, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

Read more about creating a library [in the docs](https://kit.svelte.dev/docs/packaging).

### Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

### Building

To build your library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

### Publishing

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish your library to [npm](https://www.npmjs.com):

```bash
npm publish
```
