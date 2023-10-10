<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import CopyToClipboard from '$components/CopyToClipboard.svelte';
	import PublishedDataset from '$components/data-upload/PublishedDataset.svelte';
	import PublishedDatasetOperations from '$components/data-upload/PublishedDatasetOperations.svelte';
	import StacAssetExplorer from '$components/stac/StacAssetExplorer.svelte';
	import { fromLocalStorage, getAccessLevelIcon, storageKeys, toLocalStorage } from '$lib/helper';
	import type { DatasetFeature, Layer, RasterTileMetadata } from '$lib/types';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import type { PageData } from './$types';
	import { MapStyles } from '$lib/config/AppConfig';
	import { goto } from '$app/navigation';

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

	const dataAddedToMap = async (e: {
		detail: {
			layers: [
				{
					geohubLayer: Layer;
					layer: RasterLayerSpecification;
					source: RasterSourceSpecification;
					sourceId: string;
					metadata: RasterTileMetadata;
					colormap: string;
				}
			];
		};
	}) => {
		const layerListStorageKey = storageKeys.layerList($page.url.host);
		const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
		const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);

		let storageLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, []);
		let storageMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, {});
		let storageMapStyleId: string | undefined = fromLocalStorage(mapStyleIdStorageKey, undefined);

		// initialise local storage if they are NULL.
		if (!(storageMapStyle && Object.keys(storageMapStyle).length > 0)) {
			const res = await fetch(MapStyles[0].uri);
			const baseStyle = await res.json();
			storageMapStyle = baseStyle;
		}
		if (!storageLayerList) {
			storageLayerList = [];
		}

		let dataArray = e.detail.layers;

		for (const data of dataArray) {
			storageLayerList = [data.geohubLayer, ...storageLayerList];

			let idx = storageMapStyle.layers.length - 1;
			for (const layer of storageMapStyle.layers) {
				if (layer.type === 'symbol') {
					idx = storageMapStyle.layers.indexOf(layer);
					break;
				}
			}
			storageMapStyle.layers.splice(idx, 0, data.layer);

			if (!storageMapStyle.sources[data.sourceId]) {
				storageMapStyle.sources[data.sourceId] = data.source;
			}
		}

		// save layer info to localstorage
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}`;
		goto(url, { invalidateAll: true });
	};
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
			<p class="title is-5">STAC data explorer</p>

			<StacAssetExplorer stacId={stacType} {collection} on:dataAdded={dataAddedToMap} />
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
