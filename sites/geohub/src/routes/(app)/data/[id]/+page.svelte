<script lang="ts">
	import { browser } from '$app/environment';
	import CopyToClipboard from '$components/CopyToClipboard.svelte';
	import PublishedDataset from '$components/data-upload/PublishedDataset.svelte';
	import PublishedDatasetOperations from '$components/data-upload/PublishedDatasetOperations.svelte';
	import StacAssetExplorer from '$components/data-upload/StacAssetExplorer.svelte';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

	const handleDeleted = () => {
		if (browser) {
			window.location.href = '/data';
		}
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

	let isStac = feature.properties.tags.find((t) => t.key === 'type' && t.value === 'stac');
</script>

<div class="m-4 py-5">
	<div class="is-flex">
		<p class="title is-3 px-2 m-0">
			{#if accessIcon}
				<i class="{accessIcon} p-1 pr-2" />
			{/if}
			{feature.properties.name}
		</p>
		<div style="margin-left: auto;">
			<PublishedDatasetOperations bind:feature on:deleted={handleDeleted} />
		</div>
	</div>

	<PublishedDataset bind:feature showDatatime={true} showLicense={true} />

	{#if isStac}
		{@const stacType = feature.properties.tags.find((t) => t.key === 'stac').value}
		{@const urlparts = feature.properties.url.split('/')}
		{@const collection = urlparts[urlparts.length - 2]}
		<div class="mx-3">
			<StacAssetExplorer {stacType} {collection} />
		</div>
	{/if}

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
