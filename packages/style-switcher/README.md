# @undp-data/style-switcher

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Usage

```shell
pnppm i @undp-data/style-switcher
```

```svelte
<script lang="ts">
	import MaplibreStyleSwitcherControl, { type StyleDefinition } from '$lib';

	let styles: StyleDefinition[] = [
		{
			title: 'Carto',
			uri: 'https://unpkg.com/@undp-data/style@latest/dist/style.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@latest/dist/style.json&ratio=2'
		},
		{
			title: 'Bing Aerial',
			uri: 'https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json&ratio=2'
		}
	];

	const styleSwitcherControl = new MaplibreStyleSwitcherControl(styles);
	map.addControl(styleSwitcherControl, 'bottom-left');

	map.once('styledata', () => {
		styleSwitcherControl.initialise();
	});
</script>
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
