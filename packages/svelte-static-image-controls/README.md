# @undp-data/svelte-geohub-static-image-controls

This package is to add controls for GeoHub Static Image API

## Install

```
pnpm i -D @undp-data/svelte-geohub-static-image-controls
```

## Usage

- Maplibre control

Use `MaplibreStaticImageControl` class if you want to add a control of maplibre.

```svelte
<script lang="ts">
	import { MaplibreStaticImageControl } from '@undp-data/svelte-geohub-static-image-controls';
	import '@undp-data/undp-bulma/dist/style.css';
	import { Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: Map;

	let options: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		retina: false,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		dpi: 96
	};

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: styleUrl,
			center: [0, 0],
			zoom: 0,
			bearing: 0,
			pitch: 0
		});
	});

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		console.log(e.detail.url);
	};
</script>

<div bind:this={mapContainer} class="map">
	{#if map}
		<MaplibreStaticImageControl
			bind:map
			show={true}
			style="https://unpkg.com/@undp-data/style@latest/dist/style.json"
			apiBase="https://staticimage.undpgeohub.org/api"
			on:change={handleUrlChanged}
			bind:options
		/>
	{/if}
</div>
```

- Svelte component

```svelte
<script lang="ts">
	import { StaticImageControl } from '@undp-data/svelte-geohub-static-image-controls';

	let options: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		retina: false,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		dpi: 96
	};

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		console.log(e.detail.url);
	};
</script>

<StaticImageControl
	bind:map
	show={true}
	style="https://unpkg.com/@undp-data/style@latest/dist/style.json"
	apiBase="https://unpkg.com/@undp-data/style@latest/dist/style.json"
	on:change={handleUrlChanged}
	bind:options
/>

{#if apiUrl}
	<div class="mt-2">
		<a class="button is-primary is-fullwidth" href={apiUrl} target="_blank">Export</a>
	</div>
{/if}
```

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
