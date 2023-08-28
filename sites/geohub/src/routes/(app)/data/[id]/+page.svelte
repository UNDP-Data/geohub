<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { DatasetFeature } from '$lib/types';
	import { SiteInfo } from '$lib/config/AppConfig';
	import PublishedDataset from '$components/data-upload/PublishedDataset.svelte';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	let title = `${feature.properties.name} | Data | GeoHub`;
	let content = `${feature.properties.description}`;
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
	<meta name="twitter:image" content="/api/og?content={encodeURIComponent(content)}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

<div class="m-2">
	<p class="title is-3 px-2 m-0">{feature.properties.name}</p>
	<PublishedDataset bind:feature showDatatime={true} showLicense={true} />
</div>
