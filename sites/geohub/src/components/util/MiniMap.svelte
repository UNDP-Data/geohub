<script lang="ts">
	import { page } from '$app/stores';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { DatasetFeature, StacCollection } from '$lib/types';
	import type {
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	export let width = '100%';
	export let height = '100%';
	export let isLoadMap = false;
	export let layer: VectorLayerTileStatLayer | undefined = undefined;
	export let band: string | undefined = undefined;
	export let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle' | undefined =
		undefined;

	let config: UserConfig = $page.data.config;
	let mapContainer: HTMLDivElement;
	let map: Map;
	let previewImageUrl: string | undefined = undefined;
	let isLoading = false;

	export let metadata: RasterTileMetadata | VectorTileMetadata | undefined = undefined;
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

	$: if (mapContainer && isLoadMap === true) {
		handleMapChanged();
	}

	$: layerType, handleMapChanged();

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

				dispatch('layerAdded', data);
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
					dispatch('layerAdded', data);
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
