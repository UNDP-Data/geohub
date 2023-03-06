# @undp-data/style-viewer

This component is a simple maplibre style viewer.

## Usage

```svelte
<script lang="ts">
	import { StyleViewer } from '@undp-data/style-viewer';
</script>

<div>
	<StyleViewer />
</div>
```

in `+page.server.ts`, set azureUrl from `AZURE_STORAGE_ACCOUNT` variable.

```ts
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	return {
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`
	};
};
```

## create svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

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
