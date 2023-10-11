<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { SiteInfo } from '$lib/config/AppConfig';

	let title = $page.data.title ?? 'GeoHub';
	let content = $page.data.content ?? 'GeoHub';
	let site_name = $page.data.site_name ?? SiteInfo.site_name;
	let site_description = $page.data.site_description ?? SiteInfo.site_description;

	afterNavigate(() => {
		title = $page.data.title ?? 'GeoHub';
		content = $page.data.content ?? 'GeoHub';
		site_name = $page.data.site_name ?? SiteInfo.site_name;
		site_description = $page.data.site_description ?? SiteInfo.site_description;
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
	<meta
		property="og:image"
		content="{$page.data.staticImageApi}/og?content={content}&url={$page.data.ogStyle}"
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta
		name="twitter:image"
		content="{$page.data.staticImageApi}/og?content={content}&url={$page.data.ogStyle}"
	/>
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />

	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<slot />

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
</style>
