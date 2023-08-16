<script lang="ts">
	import { page } from '$app/stores';
	import type { StyleSpecification } from 'maplibre-gl';
	import App from '$components/App.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';

	$: style = $page.data?.style?.style as StyleSpecification;

	$: title = style ? `${style.name} | Map | GeoHub` : 'Map | GeoHub';
	$: content = style ? style.name : 'Map';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
	<meta
		property="og:url"
		content="{$page.url.origin}{$page.url.pathname}{$page.url.searchParams.get('style')
			? `?style=${$page.url.searchParams.get('style')}`
			: ''}"
	/>
</svelte:head>

<App />
