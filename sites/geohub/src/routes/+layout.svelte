<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		children?: Snippet;
	}

	let { data = $bindable(), children }: Props = $props();

	let title = $state(data.title);
	let content = $state(data.content);
	let site_name = $state(data.site_name);
	let site_description = $state(data.site_description);
	let socialImage = $state(data.socialImage);
	let ogUrl = $state(data.ogUrl);

	afterNavigate(() => {
		if (browser) {
			title = page.data.title;
			content = page.data.content;
			site_name = page.data.site_name;
			site_description = page.data.site_description;
			socialImage = page.data.socialImage;
			ogUrl = page.data.ogUrl;
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={site_description} />
	<meta property="og:description" content={site_description} />
	<meta name="twitter:description" content={site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content={socialImage.replace('{content}', content)} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content={socialImage.replace('{content}', content)} />
	<meta property="og:url" content={ogUrl} />

	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
		}

		html {
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

{@render children?.()}

<style global lang="scss">
	@import '@undp-data/undp-bulma/dist/undp-bulma.css';
</style>
