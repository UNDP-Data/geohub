<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RasterAlgorithmExplorer, {
		type AlgorithmLayerSpec
	} from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import DatasetPreview from '$components/pages/data/datasets/DatasetPreview.svelte';
	import PublishedDataset from '$components/pages/data/datasets/PublishedDataset.svelte';
	import UserPermission, {
		DatasetPermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles, Permission, TabNames } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getAccessLevelIcon,
		getFirstSymbolLayerId,
		isRgbRaster,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { DatasetFeature, Layer, RasterTileMetadata } from '$lib/types';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import {
		FieldControl,
		HeroHeader,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: feature.properties.name, url: $page.url.href }
	];

	let tabs: Tab[] = [
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.PREVIEW}`,
			label: TabNames.PREVIEW
		},
		{
			id: `#${TabNames.LINKS}`,
			label: TabNames.LINKS
		}
	];

	let activeTab: string = `#${TabNames.INFO}`;

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
	let isRgbTile = false;

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
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}/edit`;
		goto(url, { invalidateAll: true });
	};

	const checkRgbTile = async () => {
		const rasterTile = new RasterTileData(feature);
		const rasterInfo = await rasterTile.getMetadata();
		isRgbTile = isRgbRaster(rasterInfo.colorinterp);
	};

	onMount(async () => {
		if (feature.properties.permission >= Permission.READ && !isStac) {
			tabs = [
				...tabs.filter((t) => t.id !== `#${TabNames.LINKS}`),
				{
					id: `#${TabNames.PERMISSIONS}`,
					label: TabNames.PERMISSIONS
				},
				tabs.find((t) => t.id === `#${TabNames.LINKS}`)
			];
		}

		if (feature.properties.is_raster && !isStac) {
			await checkRgbTile();
			if (!isRgbTile) {
				const tabIndex = tabs.findIndex((t) => t.id === `#${TabNames.PREVIEW}`);
				tabs.splice(tabIndex + 1, 0, {
					id: `#${TabNames.TOOLS}`,
					label: TabNames.TOOLS
				});
				tabs = [...tabs];
			}
		}
		let hash = $page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;
	});

	const handleAlgorithmSelected = async (e) => {
		let layerSpec: AlgorithmLayerSpec = e.detail;

		const layerListStorageKey = storageKeys.layerList($page.url.host);
		const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
		const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);

		let storageLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, []);
		let storageMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, {});
		let storageMapStyleId: string | undefined = fromLocalStorage(mapStyleIdStorageKey, undefined);

		if (storageMapStyleId) {
			// if style ID is in localstorage, reset layerList and mapStyle to add a dataset to blank map.
			storageLayerList = null;
			storageMapStyle = null;
			storageMapStyleId = null;
		}

		// initialise local storage if they are NULL.
		if (!(storageMapStyle && Object.keys(storageMapStyle).length > 0)) {
			const res = await fetch(MapStyles[0].uri);
			const baseStyle = await res.json();
			storageMapStyle = baseStyle;
		}
		if (!storageLayerList) {
			storageLayerList = [];
		}

		const rasterTile = new RasterTileData(feature);
		const rasterInfo = await rasterTile.getMetadata(layerSpec.algorithmId);
		const metadata = rasterInfo;

		if (layerSpec.algorithm.outputs.unit) {
			feature.properties.tags.push({
				key: 'unit',
				value: layerSpec.algorithm.outputs.unit
			});
		}

		metadata.active_band_no = Object.keys(metadata.stats)[0];

		// add layer to local storage
		storageLayerList = [
			{
				id: layerSpec.layerId,
				name: feature.properties.name,
				info: metadata,
				dataset: feature,
				colorMapName: layerSpec.colormap_name
			},
			...storageLayerList
		];

		let idx = storageMapStyle.layers.length - 1;

		const firstSymbolLayerId = getFirstSymbolLayerId(storageMapStyle.layers);
		if (firstSymbolLayerId) {
			idx = storageMapStyle.layers.findIndex((l) => l.id === firstSymbolLayerId);
		}
		storageMapStyle.layers.splice(idx, 0, layerSpec.layer);

		if (!storageMapStyle.sources[layerSpec.sourceId]) {
			storageMapStyle.sources[layerSpec.sourceId] = layerSpec.source;
		}

		// save layer info to localstorage
		toLocalStorage(mapStyleIdStorageKey, storageMapStyleId);
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		goto('/maps/edit', { invalidateAll: true });
	};
</script>

<HeroHeader
	title={feature.properties.name}
	icon={accessIcon}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<div class="mx-6 my-4">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<PublishedDataset bind:feature />
	</div>
	<div hidden={activeTab !== `#${TabNames.PREVIEW}`}>
		{#if isStac}
			{@const stacId = feature.properties.tags.find((t) => t.key === 'stac').value}
			{@const urlparts = feature.properties.url.split('/')}
			{@const collection = urlparts[urlparts.length - 2]}
			{@const isCatalog =
				feature.properties.tags.find((t) => t.key === 'stacApiType')?.value === 'catalog'}

			{#if isCatalog}
				<StacCatalogExplorer {stacId} bind:dataset={feature} on:dataAdded={dataAddedToMap} />
			{:else}
				<StacApiExplorer {stacId} {collection} on:dataAdded={dataAddedToMap} />
			{/if}
		{:else}
			<DatasetPreview bind:feature />
		{/if}
	</div>

	{#if feature.properties.is_raster && !isStac}
		<div hidden={activeTab !== `#${TabNames.TOOLS}`}>
			<RasterAlgorithmExplorer bind:feature on:added={handleAlgorithmSelected} />
		</div>
	{/if}

	{#if $page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new DatasetPermissionAPI(feature)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<div class="mx-3 mt-4">
			<p class="title is-5">For developers</p>
			{#if datasetApi}
				<FieldControl
					title="GeoHub Dataset API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={datasetApi} />
					</div>
					<div slot="help"><a href="/api" target="_blank">Learn more about GeoHub API</a></div>
				</FieldControl>
			{/if}
			{#if previewUrl}
				<FieldControl
					title="Preview URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={previewUrl} />
					</div>
					<div slot="help">{`Please replace {width} and {height} to pixel values`}</div>
				</FieldControl>
			{/if}
			{#if downloadUrl}
				<FieldControl
					title="File URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={!feature.properties.is_raster}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={downloadUrl} />
					</div>
					<div slot="help">
						<a href="https://protomaps.com/docs/frontends/maplibre" target="_blank"
							>Learn more about how to integrate PMTiles with Maplibre GL JS</a
						>
					</div>
				</FieldControl>
			{/if}

			{#if tilesUrl}
				<FieldControl
					title="Titiler Tiles API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={tilesUrl} />
					</div>
				</FieldControl>
			{/if}
			{#if infoUrl}
				<FieldControl
					title="Titiler Info API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={infoUrl} />
					</div>
				</FieldControl>
			{/if}
			{#if statisticsUrl}
				<FieldControl
					title="Titiler Statistics API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={statisticsUrl} />
					</div>
				</FieldControl>
			{/if}

			{#if tilejson}
				<FieldControl
					title="TileJSON URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={tilejson} />
					</div>
				</FieldControl>
			{/if}

			{#if infoUrl || statisticsUrl || tilesUrl}
				<a href="{new URL(infoUrl).origin}/docs" target="_blank">Learn more about Titiler API</a>
			{/if}

			{#if pbfUrl}
				<FieldControl
					title="Vector Tile PBF URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={pbfUrl} />
					</div>
				</FieldControl>
			{/if}

			{#if metadatajson}
				<FieldControl
					title="Metadata JSON URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					<div slot="control">
						<CopyToClipboard value={metadatajson} />
					</div>
				</FieldControl>
			{/if}
		</div>
	</div>
</div>
