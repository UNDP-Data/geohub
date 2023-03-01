# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Usage

Prior to use this package, please load required datasets from GeoHub API in your `+page.server.ts`. The following source code is sample code. The app will access dataset URL through `$page.data.datasets` in frontend component.

```ts
import { ELECTRICITY_DATASETS } from '$lib';
import type { PageServerLoad } from './$types';

const API_URL = 'https://dev.undpgeohub.org/api/datasets/';

export const load: PageServerLoad = async (event) => {
	const datasets = JSON.parse(JSON.stringify(ELECTRICITY_DATASETS));

	for (const ds of datasets.hrea) {
		const res = await event.fetch(`${API_URL}${ds.id}`);
		const json = await res.json();
		ds.url = json.properties.url;
	}

	for (const ds of datasets.ml) {
		const res = await event.fetch(`${API_URL}${ds.id}`);
		const json = await res.json();
		ds.url = json.properties.url;
	}

	return {
		datasets
	};
};
```

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
