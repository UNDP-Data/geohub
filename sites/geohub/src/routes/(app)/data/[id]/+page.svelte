<script lang="ts">
	import { page } from '$app/stores';
	import CopyToClipboard from '$components/CopyToClipboard.svelte';
	import PublishedDataset from '$components/data-upload/PublishedDataset.svelte';
	import PublishedDatasetOperations from '$components/data-upload/PublishedDatasetOperations.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import type { DatasetFeature } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	let title = `${feature.properties.name} | Data | GeoHub`;
	let content = `${feature.properties.description}`;

	const handleDeleted = () => {
		window.location.href = '/data';
	};

	const links = feature.properties.links;
	const datasetApi = links.find((l) => l.rel === 'self')?.href;
	const downloadUrl = links.find((l) => l.rel === 'download')?.href;
	const infoUrl = links.find((l) => l.rel === 'info')?.href;
	const statisticsUrl = links.find((l) => l.rel === 'statistics')?.href;
	const tilesUrl = links.find((l) => l.rel === 'tiles')?.href;
	const metadatajson = links.find((l) => l.rel === 'metadatajson')?.href;
	const tilejson = links.find((l) => l.rel === 'tilejson')?.href;
	const pbfUrl = links.find((l) => l.rel === 'pbf')?.href;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" {content} />
	<meta property="og:description" {content} />
	<meta name="twitter:description" {content} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="{$page.url.origin}/api/og?content={title}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og?content={title}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

<div class="m-4 py-5">
	<div class="is-flex">
		<p class="title is-3 px-2 m-0">{feature.properties.name}</p>
		<div style="margin-left: auto;">
			<PublishedDatasetOperations bind:feature on:deleted={handleDeleted} />
		</div>
	</div>

	<PublishedDataset bind:feature showDatatime={true} showLicense={true} />

	<div class="mx-3 mt-4">
		<p class="title is-5">For developers</p>
		{#if datasetApi}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">GeoHub Dataset API URL</label>
				<div class="control">
					<CopyToClipboard value={datasetApi} />
				</div>
			</div>
			<div class="mb-2">
				<a href="/api" target="_blank">Learn more about GeoHub API</a>
			</div>
		{/if}
		{#if downloadUrl}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">File URL</label>
				<div class="control">
					<CopyToClipboard value={downloadUrl} />
				</div>
			</div>
			{#if !feature.properties.is_raster}
				<div class="mb-2">
					<a href="https://protomaps.com/docs/frontends/maplibre" target="_blank"
						>Learn more about how to integrate PMTiles with Maplibre GL JS</a
					>
				</div>
			{/if}
		{/if}

		{#if tilesUrl}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Titiler Tiles API URL</label>
				<div class="control">
					<CopyToClipboard value={tilesUrl} />
				</div>
			</div>
		{/if}
		{#if infoUrl}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Titiler Info API URL</label>
				<div class="control">
					<CopyToClipboard value={infoUrl} />
				</div>
			</div>
		{/if}
		{#if statisticsUrl}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Titiler Statistics API URL</label>
				<div class="control">
					<CopyToClipboard value={statisticsUrl} />
				</div>
			</div>
		{/if}

		{#if tilejson}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">TileJSON URL</label>
				<div class="control">
					<CopyToClipboard value={tilejson} />
				</div>
			</div>
		{/if}

		{#if infoUrl || statisticsUrl || tilesUrl}
			<a href="{new URL(infoUrl).origin}/docs" target="_blank">Learn more about Titiler API</a>
		{/if}

		{#if pbfUrl}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Vector Tile PBF URL</label>
				<div class="control">
					<CopyToClipboard value={pbfUrl} />
				</div>
			</div>
		{/if}

		{#if metadatajson}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Metadata JSON URL</label>
				<div class="control">
					<CopyToClipboard value={metadatajson} />
				</div>
			</div>
		{/if}
	</div>
</div>
