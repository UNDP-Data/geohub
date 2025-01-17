<script lang="ts">
	import { page } from '$app/state';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { DatasetFeature, LayerCreationInfo, StacCollection } from '$lib/types';
	import type {
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
	import { onMount, untrack } from 'svelte';

	let config: UserConfig = page.data.config;
	let mapContainer: HTMLDivElement | undefined = $state();
	let map: Map;
	let previewImageUrl: string | undefined = $state(undefined);
	let isLoading = $state(false);

	interface Props {
		feature: DatasetFeature;
		width?: string;
		height?: string;
		isLoadMap?: boolean;
		layer?: VectorLayerTileStatLayer | undefined;
		band?: string | undefined;
		layerType?: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle' | undefined;
		metadata?: RasterTileMetadata | VectorTileMetadata | undefined;
		onLayerAdded?: (data: LayerCreationInfo) => void;
	}

	let {
		feature = $bindable(),
		width = $bindable('100%'),
		height = $bindable('100%'),
		isLoadMap = $bindable(false),
		layer = $bindable(undefined),
		band = $bindable(undefined),
		layerType = $bindable(undefined),
		metadata = $bindable(undefined),
		onLayerAdded = () => {}
	}: Props = $props();
	let rasterTile: RasterTileData;
	let vectorTile: VectorTileData;

	const addStacPreview = async (url: string) => {
		const res = await fetch(url.replace('/items', ''));
		const collection: StacCollection = await res.json();
		let previewImage = collection.assets?.thumbnail?.href;
		if (previewImage) {
			return previewImage;
		}
	};

	const preloadMap = async () => {
		const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
			{ key: string; value: string }
		];
		const isStac = tags?.find((tag) => tag.key === 'stac');
		const stacType = tags?.find((tag) => tag.key === 'stacType');
		let previewUrl = '';
		if (isStac && stacType?.value === 'collection') {
			previewUrl = (await addStacPreview(feature.properties.url)) as string;
		} else if (feature.properties.is_raster === true) {
			rasterTile = new RasterTileData(feature);
			metadata = await rasterTile.getMetadata();
		} else {
			vectorTile = new VectorTileData(feature, config.FillExtrusionDefaultPitch);
			metadata = await vectorTile.getMetadata();
		}
		return previewUrl;
	};

	const handleMapChanged = async () => {
		if (!map) return;

		map.setStyle(MapStyles[0].uri);
		addGeoHubLayer();
	};

	const addGeoHubLayer = async () => {
		if (!map) return;
		isLoading = true;

		try {
			if (feature.properties.is_raster === true) {
				const stacType = feature.properties.tags?.find((tag) => tag.key === 'stacType');
				if (stacType?.value === 'collection') return;
				const rasterInfo: RasterTileMetadata = metadata as RasterTileMetadata;
				if (!rasterInfo.band_metadata) return;
				let bandIndex = rasterInfo.band_metadata.findIndex((b) => {
					return b[0] === band;
				});
				if (bandIndex === -1) {
					bandIndex = undefined;
				}
				const data = await rasterTile.add(map, bandIndex);
				metadata = data.metadata;
				if (onLayerAdded) onLayerAdded(data);
			} else {
				if (layer) {
					let layerName = layer ? layer.layer : undefined;

					if (!layerType) {
						if (layer?.geometry.toLocaleLowerCase() === 'point') {
							layerType = 'point';
						} else if (layer?.geometry.toLocaleLowerCase() === 'polygon') {
							layerType = 'polygon';
						} else if (layer?.geometry.toLocaleLowerCase() === 'linestring') {
							layerType = 'linestring';
						}
					}
					const data = await vectorTile.add(map, layerType, layerName);
					metadata = data.metadata;
					if (onLayerAdded) onLayerAdded(data);
				}
			}
			map.resize();
		} finally {
			isLoading = false;
		}
	};

	onMount(() => {
		preloadMap().then((imageUrl) => {
			previewImageUrl = imageUrl;
			if (!mapContainer) return;
			if (!previewImageUrl) {
				map = new Map({
					container: mapContainer,
					style: MapStyles[0].uri,
					attributionControl: false,
					maxPitch: 85
				});

				map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

				map.addControl(
					new NavigationControl({
						showCompass: true
					}),
					'bottom-right'
				);

				map.once('load', addGeoHubLayer);
			}
		});
	});
	$effect(() => {
		if (mapContainer && isLoadMap === true) {
			untrack(() => {
				handleMapChanged();
			});
		}
	});
	$effect(() => {
		if (layerType !== undefined) {
			untrack(() => {
				handleMapChanged();
			});
		}
	});
</script>

<div class="map-container">
	{#if previewImageUrl}
		<img src={previewImageUrl} alt="preview" style="width:{width}" />
	{:else}
		{@const isStac = feature.properties.tags?.find((tag) => tag.key === 'stac')}
		{@const stacType = feature.properties.tags?.find((tag) => tag.key === 'stacType')}
		{#if !(isStac && stacType?.value === 'collection')}
			{#if isLoading}
				<div
					class="loader-container is-flex is-justify-content-center is-align-items-center"
					style="width:{width}; height:{height};"
				>
					<Loader size="small" />
				</div>
			{/if}
			<div
				class="map"
				style="width:{width}; height:{isLoading ? '0' : height}; opacity: {isLoading ? '0' : '1'};"
				bind:this={mapContainer}
			></div>
		{/if}
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.loader-container {
		border: 1px solid gray;
	}

	.map-container {
		position: relative;
		text-align: center;
		vertical-align: middle;

		.map {
			padding: 0;
			margin: 0;
			border: 1px solid gray;
		}
	}
</style>
