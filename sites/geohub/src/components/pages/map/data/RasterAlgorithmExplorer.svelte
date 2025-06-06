<script module lang="ts">
	export interface AlgorithmLayerSpec {
		algorithmId: string;
		algorithm: RasterAlgorithm;
		sourceId: string;
		source: RasterSourceSpecification | RasterDEMSourceSpecification;
		layerId: string;
		layer: HillshadeLayerSpecification | RasterLayerSpecification;
		colormap_name?: string;
	}

	export const ALGORITHM_TAG_KEY = 'algorithm';

	export const algorithmCategory: { [key: string]: string } = {
		// algorithms for index
		normalizedindex: 'index',

		// algorithms for terrain elevation
		hillshade: 'terrain',
		contours: 'terrain',
		slope: 'terrain',
		terrarium: 'terrain',
		terrainrgb: 'terrain',

		// algorithms for math operations
		cast: 'operation',
		floor: 'operation',
		ceil: 'operation',
		// algorithms for statistics
		min: 'statistic',
		max: 'statistic',
		median: 'statistic',
		mean: 'statistic',
		std: 'statistic',
		var: 'statistic'
	};
</script>

<script lang="ts">
	import { RasterTileData } from '$lib/RasterTileData';
	import { isRgbRaster } from '$lib/helper';
	import type { DatasetFeature, Link, Tag } from '$lib/types';
	import {
		getRandomColormap,
		Notification,
		type RasterAlgorithm,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Card, Loader } from '@undp-data/svelte-undp-design';
	import type {
		HillshadeLayerSpecification,
		RasterDEMSourceSpecification,
		RasterLayerSpecification,
		RasterSourceSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	interface Props {
		feature: DatasetFeature;
		title?: string;
		cardDescription?: string;
		/**
		 * 'map' mode will add the dataset with selected algorithm to the local storage for map edit page. 'map' mode trigger an event of 'added'
		 * 'select' mode will show tick icon if an algorithm is selected. 'select' mode trigger an event 'selected'.
		 * default is 'map' mode.
		 */
		mode?: 'map' | 'select';
		/**
		 * If enabled together with select mode, it will add/remove tool from dataset.properties.tags
		 */
		toggleTool?: boolean;
		onAdded?: (layerSpec: AlgorithmLayerSpec) => void;
		onSelected?: (tag: Tag, algorithm: RasterAlgorithm) => void;
	}

	let {
		feature,
		title = 'Choose a tool',
		cardDescription = 'use this tool',
		mode = 'map',
		toggleTool = true,
		onAdded = () => {},
		onSelected = () => {}
	}: Props = $props();

	let isLoaded = $state(false);

	let metadata: RasterTileMetadata;
	let links: Link[] = feature.properties.links as Link[];

	let availableBands = $state([]);

	let algorithms: { [key: string]: RasterAlgorithm } = $state({});

	let isRgbTile = $state(false);
	let tagSelectionChanged = $state(false);

	const isCatalog =
		feature.properties.tags?.find((t) => t.key === 'stacApiType')?.value === 'catalog';

	const getAlgorithms = async () => {
		const algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href as string;
		const res = await fetch(algorithmsLink);
		algorithms = await res.json();
	};

	const getMetadata = async (algorithmId?: string) => {
		if (feature.properties.is_raster) {
			if (!isCatalog) {
				const rasterTile = new RasterTileData(feature);
				const rasterInfo = (await rasterTile.getMetadata(algorithmId)) as RasterTileMetadata;
				metadata = rasterInfo;
				availableBands =
					metadata.band_metadata.length > 0
						? (metadata.band_metadata.map((meta) => meta[0]) as string[])
						: [];
				isRgbTile = isRgbRaster(metadata.colorinterp);
			}
		}
	};

	const handleAlgorithmSelected = async (id: string) => {
		if (mode === 'map') {
			let layerSpec: AlgorithmLayerSpec;
			switch (id) {
				case 'terrarium':
				case 'terrainrgb':
					layerSpec = createRasterDemSource(id);
					break;
				default:
					layerSpec = createRasterSource(id);
					break;
			}
			if (onAdded) onAdded(layerSpec);
		} else {
			if (toggleTool) {
				let tags = feature.properties.tags;
				const selectedTags = tags.filter((t) => t.key === ALGORITHM_TAG_KEY && t.value === id);
				if (selectedTags.length > 0) {
					tags = tags.filter((t) => !(t.key === ALGORITHM_TAG_KEY && t.value === id));
				} else {
					tags.push({
						key: ALGORITHM_TAG_KEY,
						value: id
					});
				}

				feature.properties.tags = [...tags];
			}
			const tag = {
				key: ALGORITHM_TAG_KEY,
				value: id
			};
			if (onSelected) onSelected(tag, algorithms[id]);
			tagSelectionChanged = !tagSelectionChanged;
		}
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
		// exclude hillshade to use colormap
		if (!['hillshade'].includes(id)) {
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
		}

		return decodeURIComponent(algoUrl.href);
	};

	const createRasterSource = (id: string) => {
		const algoUrl = getAlgoTileUrl(id);
		const layerId = uuidv4();
		const sourceId = layerId;

		const source: RasterSourceSpecification = {
			type: 'raster',
			tiles: [algoUrl],
			attribution: getAttribution(),
			bounds: metadata.bounds as [number, number, number, number]
		};

		const colormap_name = new URL(algoUrl).searchParams.get('colormap_name') ?? '';

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
			algorithmId: id,
			algorithm: algorithms[id],
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

		const layerId = uuidv4();
		const sourceId = layerId;
		const source: RasterDEMSourceSpecification = {
			type: 'raster-dem',
			tiles: [algoUrl],
			encoding,
			bounds: metadata.bounds as [number, number, number, number],
			attribution: getAttribution()
		};

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
			algorithmId: id,
			algorithm: algorithms[id],
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
	{@const ids = Object.keys(algorithms).filter((id) => {
		if (isCatalog) {
			const algo = feature.properties.tags?.find(
				(t) => t.key === ALGORITHM_TAG_KEY && t.value === id
			);
			return algo ? true : false;
		} else {
			return algorithms[id].inputs.nbands <= availableBands.length;
		}
	})}
	{#if ids.length === 0 || isRgbTile}
		<Notification type="info" showCloseButton={false}>
			No tools available for this dataset
		</Notification>
	{:else}
		<h4 class="title is-4">{title}</h4>
		<div class="columns is-multiline is-mobile">
			{#if mode === 'map'}
				<!-- if map mode, show selected algos first -->
				{#each ids as name (name)}
					{@const algo = algorithms[name]}
					{#if isCatalog || (algo.inputs.nbands <= availableBands.length && feature.properties.tags.find((t) => t.key === ALGORITHM_TAG_KEY && t.value === name))}
						<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
							<Card
								linkName={cardDescription}
								url=""
								tag={algorithmCategory[name.toLowerCase()] ?? 'geohub'}
								title={algo.title ?? name.toUpperCase()}
								description={algo.description ?? ''}
								accent="yellow"
								isEmphasize={true}
								onselect={() => {
									handleAlgorithmSelected(name);
								}}
							/>
						</div>
					{/if}
				{/each}
			{/if}

			{#key tagSelectionChanged}
				{#each ids as name (name)}
					{@const algo = algorithms[name]}
					{#if isCatalog || algo.inputs.nbands <= availableBands.length}
						{@const isSelected =
							feature.properties.tags.filter((t) => t.key === ALGORITHM_TAG_KEY && t.value === name)
								.length > 0}
						{#if (mode === 'map' && !isSelected) || mode === 'select'}
							<!-- if select mode, show all available algorithms -->
							<!-- if map mode, show only unselected algorithms -->
							<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
								<Card
									linkName={cardDescription}
									url=""
									tag={algorithmCategory[name.toLowerCase()] ?? 'geohub'}
									title={algo.title ?? name.toUpperCase()}
									description={algo.description ?? ''}
									isEmphasize={mode === 'select' && isSelected}
									onselect={() => {
										handleAlgorithmSelected(name);
									}}
								/>
							</div>
						{/if}
					{/if}
				{/each}
			{/key}
		</div>
	{/if}
{/if}
