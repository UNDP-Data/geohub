<script lang="ts">
	import { page } from '$app/stores';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type {
		DatasetFeature,
		RasterTileMetadata,
		StacCollection,
		StacItemFeatureCollection,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import maplibregl, { Map, NavigationControl } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';

	export let feature: DatasetFeature;
	export let width = '100%';
	export let height = '100%';
	export let isLoadMap = false;
	export let defaultColor: string = undefined;
	export let defaultColormap: string = undefined;
	export let layer: VectorLayerTileStatLayer = undefined;
	export let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' = undefined;

	let defaultLineWidth = $page.data.config.LineWidth;
	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let mapContainer: HTMLDivElement;
	let map: Map;
	let previewImageUrl: Promise<string>;
	let isLoading = false;

	export let metadata: RasterTileMetadata | VectorTileMetadata = undefined;
	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const url: string = feature.properties.url;

	let rasterTile: RasterTileData;
	let vectorTile: VectorTileData;

	const addStacPreview = async (url: string) => {
		const res = await fetch(url.replace('/items', ''));
		const collection: StacCollection = await res.json();
		let previewImage = collection.assets?.thumbnail?.href;
		if (previewImage) {
			return previewImage;
		}
		const resItems = await fetch(`${url}?limit=1`);
		const fc: StacItemFeatureCollection = await resItems.json();
		previewImage = fc.features[0].assets.thumbnail?.href;
		return previewImage;
	};

	const preloadMap = async () => {
		const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
			{ key: string; value: string }
		];
		const isStac = tags?.find((tag) => tag.key === 'stac');
		const stacType = tags?.find((tag) => tag.key === 'stacType');
		let previewUrl: string;
		if (isStac && !stacType) {
			previewUrl = await addStacPreview(url);
		} else if (is_raster === true) {
			const rasterInfo = metadata as RasterTileMetadata;
			rasterTile = new RasterTileData(feature, rasterInfo);
			metadata = await rasterTile.getMetadata();
		} else {
			const vectorInfo = metadata as VectorTileMetadata;
			vectorTile = new VectorTileData(feature, defaultLineWidth, undefined, vectorInfo);
			metadata = await (await vectorTile.getMetadata()).metadata;
		}
		return previewUrl;
	};

	previewImageUrl = preloadMap();

	$: if (mapContainer && isLoadMap === true) {
		loadMiniMap();
	}

	$: layerType, loadMiniMap();

	const loadMiniMap = async () => {
		if (!mapContainer) return;
		isLoading = true;
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			attributionControl: false
			// interactive: false,
		});
		map.addControl(
			new NavigationControl({
				showCompass: false
			}),
			'bottom-right'
		);
		map.dragRotate.disable();
		map.touchZoomRotate.disableRotation();

		map.once('load', async () => {
			try {
				if (is_raster === true) {
					const data = await rasterTile.add(map);
					metadata = data.metadata;
					defaultColormap = data.colormap;
				} else {
					if (layer) {
						let layerName = layer ? layer.layer : undefined;

						if (!layerType) {
							if (layer?.geometry.toLocaleLowerCase() === 'point') {
								layerType = 'point';
							} else if (layer?.geometry.toLocaleLowerCase() === 'polygon') {
								layerType = 'polygon';
							} else if (layer?.geometry.toLocaleLowerCase() === 'linestring') {
								layerType = 'line';
							}
						}
						const data = await vectorTile.add(map, layerType, undefined, layerName);
						metadata = data.metadata;
						defaultColor = data.color;
					} else {
						const vectorInfo = metadata as VectorTileMetadata;
						for (const l of vectorInfo.json.vector_layers) {
							await vectorTile.add(map, undefined, undefined, l.id);
						}
					}
				}
				map.resize();
			} finally {
				isLoading = false;
			}
		});
	};
</script>

<div class="map-container">
	{#await previewImageUrl}
		<div
			class="loader-container is-flex is-justify-content-center is-align-items-center"
			style="width:{width}; height:{height};"
		>
			<Loader size="small" />
		</div>
	{:then imageUrl}
		{#if imageUrl}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src={imageUrl} style="width:{width}" />
		{:else}
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
			/>
		{/if}
	{/await}
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
