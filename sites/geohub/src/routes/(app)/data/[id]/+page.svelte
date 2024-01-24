<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DatasetPreview from '$components/pages/data/datasets/DatasetPreview.svelte';
	import PublishedDataset from '$components/pages/data/datasets/PublishedDataset.svelte';
	import UserPermission, {
		DatasetPermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import Tabs, { type Tab } from '$components/util/Tabs.svelte';
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { MapStyles, Permission, TabNames } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getAccessLevelIcon,
		getFirstSymbolLayerId,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { DatasetFeature, Layer, RasterTileMetadata } from '$lib/types';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	let tabs: Tab[] = [
		{
			id: TabNames.INFO,
			label: TabNames.INFO
		},
		{
			id: TabNames.PREVIEW,
			label: TabNames.PREVIEW
		},
		{
			id: TabNames.LINKS,
			label: TabNames.LINKS
		}
	];

	let activeTab: string = TabNames.INFO;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

	const links = feature.properties.links;
	const datasetApi = links.find((l) => l.rel === 'self')?.href;
	const downloadUrl = links.find((l) => l.rel === 'download')?.href;
	const infoUrl = links.find((l) => l.rel === 'info')?.href;
	const statisticsUrl = links.find((l) => l.rel === 'statistics')?.href;
	const tilesUrl = links.find((l) => l.rel === 'tiles')?.href;
	const metadatajson = links.find((l) => l.rel === 'metadatajson')?.href;
	const tilejson = links.find((l) => l.rel === 'tilejson')?.href;
	const pbfUrl = links.find((l) => l.rel === 'pbf')?.href;
	const previewUrl = links.find((l) => l.rel === 'preview')?.href;

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
			const firstSymbolLayerId = getFirstSymbolLayerId(storageMapStyle.layers);
			if (firstSymbolLayerId) {
				idx = storageMapStyle.layers.findIndex((l) => l.id === firstSymbolLayerId);
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

	onMount(() => {
		if (feature.properties.permission >= Permission.READ && !isStac) {
			tabs = [
				...tabs.filter((t) => t.id !== TabNames.LINKS),
				{
					id: TabNames.PERMISSIONS,
					label: TabNames.PERMISSIONS
				},
				tabs.find((t) => t.id === TabNames.LINKS)
			];
		}
	});
</script>

<div class="m-4">
	<div class="py-4"><BackToPreviousPage defaultLink="/data" /></div>

	<div class="is-flex">
		<p class="title is-3 px-2 m-0">
			{#if accessIcon}
				<i class="{accessIcon} p-1 pr-2" />
			{/if}
			{feature.properties.name}
		</p>
	</div>

	<div class="is-fullwidth">
		<Tabs
			size="is-normal"
			isBoxed={false}
			isFullwidth={false}
			isCentered={false}
			bind:tabs
			bind:activeTab
			isUppercase={true}
			fontWeight="semibold"
		/>
	</div>

	<div hidden={activeTab !== TabNames.INFO}>
		<PublishedDataset bind:feature showDatatime={true} showLicense={true} />
	</div>
	<div hidden={activeTab !== TabNames.PREVIEW}>
		{#if isStac}
			{@const stacId = feature.properties.tags.find((t) => t.key === 'stac').value}
			{@const urlparts = feature.properties.url.split('/')}
			{@const collection = urlparts[urlparts.length - 2]}
			{@const isCatalog =
				feature.properties.tags.find((t) => t.key === 'stacApiType')?.value === 'catalog'}

			{#if isCatalog}
				<StacCatalogExplorer {stacId} on:dataAdded={dataAddedToMap} />
			{:else}
				<StacApiExplorer {stacId} {collection} on:dataAdded={dataAddedToMap} />
			{/if}
		{:else}
			<DatasetPreview bind:feature />
		{/if}
	</div>

	{#if $page.data.session}
		<div hidden={activeTab !== TabNames.PERMISSIONS}>
			<UserPermission bind:dataset={feature} api={new DatasetPermissionAPI(feature)} />
		</div>
	{/if}

	<div hidden={activeTab !== TabNames.LINKS}>
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
			{#if previewUrl}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Preview URL</label>
					<div class="control">
						<CopyToClipboard value={previewUrl} />
					</div>
					<p class="help is-info">{`Please replace {width} and {height} to pixel values`}</p>
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
</div>
