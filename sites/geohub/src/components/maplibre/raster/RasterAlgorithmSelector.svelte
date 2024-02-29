<script context="module" lang="ts">
	interface LayerSpec {
		sourceId: string;
		source: RasterSourceSpecification | RasterDEMSourceSpecification;
		layerId: string;
		layer: HillshadeLayerSpecification | RasterLayerSpecification;
		colormap_name?: string;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import FieldControl from '$components/util/FieldControl.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getFirstSymbolLayerId,
		getRandomColormap,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		Link,
		RasterAlgorithm,
		RasterTileMetadata
	} from '$lib/types';
	import { Card, Loader } from '@undp-data/svelte-undp-design';
	import type {
		HillshadeLayerSpecification,
		RasterDEMSourceSpecification,
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	export let feature: DatasetFeature;

	const algorithmCategory = {
		normalizedindex: 'index',
		hillshade: 'terrain',
		contours: 'terrain',
		terrarium: 'terrain',
		terrainrgb: 'terrain'
	};

	let isLoaded = false;

	let metadata: RasterTileMetadata;
	let links: Link[] = feature.properties.links;

	let availableBands = [];

	let algorithms: { [key: string]: RasterAlgorithm };

	const getAlgorithms = async () => {
		const algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;
		const res = await fetch(algorithmsLink);
		algorithms = await res.json();
	};

	const getMetadata = async (algorithmId?: string) => {
		if (feature.properties.is_raster) {
			const isCatalog =
				feature.properties.tags?.find((t) => t.key === 'stacApiType')?.value === 'catalog';
			if (!isCatalog) {
				const rasterTile = new RasterTileData(feature);
				const rasterInfo = await rasterTile.getMetadata(algorithmId);
				metadata = rasterInfo;
				availableBands =
					metadata.band_metadata.length > 0
						? (metadata.band_metadata.map((meta) => meta[0]) as string[])
						: [];
			}
		}
	};

	const handleAlgorithmSelected = async (id: string) => {
		let layerSpec: LayerSpec;
		switch (id) {
			case 'terrarium':
			case 'terrainrgb':
				layerSpec = createRasterDemSource(id);
				break;
			default:
				layerSpec = createRasterSource(id);
				break;
		}

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

		await getMetadata(id);
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

	const getAttribution = () => {
		const providers = feature.properties.tags
			?.filter((t) => t.key === 'provider')
			.map((t) => t.value);
		return providers.join(', ');
	};

	const getAlgoTileUrl = (id: string) => {
		const urlString = feature.properties.links.find((l) => l.rel === 'tiles').href;
		const tileUrl = new URL(urlString);
		const algoUrl = new URL(`${tileUrl.origin}${tileUrl.pathname}`);
		algoUrl.searchParams.set('url', tileUrl.searchParams.get('url'));
		algoUrl.searchParams.set('algorithm', id);

		const algo = algorithms[id];
		if (algo.outputs.min?.length > 0 && algo.outputs.max?.length > 0) {
			const rescale = [algo.outputs.min, algo.outputs.max];
			algoUrl.searchParams.set('rescale', rescale.join(','));
		}

		if (algo.outputs.nbands === 1) {
			algoUrl.searchParams.set('colormap_name', getRandomColormap('sequential'));
		}

		if (algo.inputs.nbands === 1) {
			algoUrl.searchParams.set('bidx', '1');
		}

		return decodeURIComponent(algoUrl.href);
	};

	const createRasterSource = (id: string) => {
		const algoUrl = getAlgoTileUrl(id);
		const sourceId = `${feature.properties.id}-id`;
		const source: RasterSourceSpecification = {
			type: 'raster',
			tiles: [algoUrl],
			attribution: getAttribution()
		};

		const colormap_name = new URL(algoUrl).searchParams.get('colormap_name') ?? '';

		const layerId = uuidv4();

		const layer: RasterLayerSpecification = {
			id: layerId,
			type: 'raster',
			source: sourceId,
			paint: {
				'raster-resampling': 'nearest',
				'raster-opacity': 1
			},
			layout: {
				visibility: 'visible'
			}
		};

		return {
			sourceId,
			source,
			layerId,
			layer,
			colormap_name
		};
	};

	const createRasterDemSource = (id: string) => {
		let encoding: 'terrarium' | 'mapbox' | 'custom';
		if (id === 'terrarium') {
			encoding = 'terrarium';
		} else if (id === 'terrainrgb') {
			encoding = 'mapbox';
		}

		const algoUrl = getAlgoTileUrl(id);

		const sourceId = `${feature.properties.id}-id`;
		const source: RasterDEMSourceSpecification = {
			type: 'raster-dem',
			tiles: [algoUrl],
			encoding,
			attribution: getAttribution()
		};

		const layerId = uuidv4();

		const layer: HillshadeLayerSpecification = {
			id: layerId,
			type: 'hillshade',
			source: sourceId,
			paint: {
				'hillshade-accent-color': '#000000',
				'hillshade-exaggeration': 0.5,
				'hillshade-highlight-color': '#FFFFFF',
				'hillshade-illumination-anchor': 'viewport',
				'hillshade-illumination-direction': 335,
				'hillshade-shadow-color': '#000000'
			},
			layout: {
				visibility: 'visible'
			}
		};

		return {
			sourceId,
			source,
			layerId,
			layer
		};
	};

	onMount(() => {
		getMetadata()
			.then(getAlgorithms)
			.then(() => {
				isLoaded = true;
			});
	});
</script>

{#if !isLoaded}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{:else if algorithms && Object.keys(algorithms)?.length > 0}
	{@const ids = Object.keys(algorithms).filter(
		(id) => algorithms[id].inputs.nbands <= availableBands.length
	)}
	{#if ids.length === 0}
		<Notification type="info" showCloseButton={false}>
			No tools available for this dataset
		</Notification>
	{:else}
		<FieldControl title="Choose a tool" showHelp={false}>
			<div slot="control">
				<div class="columns is-multiline is-mobile">
					{#each ids as name}
						{@const algo = algorithms[name]}
						{#if algo.inputs.nbands <= availableBands.length}
							<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
								<Card
									linkName="Use this tool"
									url=""
									tag={algorithmCategory[name.toLowerCase()] ?? 'geohub'}
									title={name.toUpperCase()}
									description=""
									on:selected={() => {
										handleAlgorithmSelected(name);
									}}
								/>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</FieldControl>
	{/if}
{/if}

<style lang="scss">
</style>
