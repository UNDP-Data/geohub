<script lang="ts">
	import { page } from '$app/stores';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type {
		DatasetFeature,
		RasterTileMetadata,
		VectorLayerSpecification,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, createMapStore } from '$stores';
	import { Map, NavigationControl, type RasterLayerSpecification } from 'maplibre-gl';
	import { onMount, setContext } from 'svelte';

	const map = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, map);

	export let feature: DatasetFeature;
	export let height = 0;

	let config: UserConfig = $page.data.config;
	let mapContainer: HTMLDivElement;

	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;

	let vectorTileData: VectorTileData;
	let rasterTileData: RasterTileData;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;
	let metadata: VectorTileMetadata | RasterTileMetadata;

	let sourceId: string;
	// let layerSpec: VectorLayerSpecification | RasterLayerSpecification;
	// let sourceSpec: VectorSourceSpecification | RasterSourceSpecification;

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	let selectedVectorLayer: VectorLayerTileStatLayer;
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';
	let tilestatsLayers: VectorLayerTileStatLayer[] = [];
	const getMetadata = async () => {
		if (is_raster) {
			rasterTileData = new RasterTileData(feature, undefined, undefined);
			metadata = await rasterTileData.getMetadata();
			rasterTileData.setMetadata(metadata);
		} else {
			const defaultLineWidth = config.LineWidth;
			vectorTileData = new VectorTileData(feature, defaultLineWidth, undefined);
			const data = await vectorTileData.getMetadata();
			metadata = data.metadata;
			vectorTileData.setMetadata(data.metadata);
			tilestatsLayers = data.metadata.json?.tilestats?.layers;
			selectedVectorLayer = tilestatsLayers[0];
		}
	};

	onMount(() => {
		initialiseMap();
		getMetadata().then(handleLayerSelected);
	});

	const initialiseMap = () => {
		$map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 3
		});

		$map.addControl(new NavigationControl(), 'bottom-right');

		$map.once('load', () => {
			mapResize();
		});
	};

	$: mapHeight, mapResize();
	const mapResize = () => {
		if (!$map) return;
		$map.redraw();
		$map.resize();
	};

	const handleLayerSelected = async () => {
		if (!$map) return;
		const style = $map.getStyle();

		if (sourceId && $map.getSource(sourceId)) {
			const layers = style.layers.filter(
				(l: VectorLayerSpecification | RasterLayerSpecification) => l.source === sourceId
			) as VectorLayerSpecification[] | RasterLayerSpecification[];
			if (layers.length > 0) {
				for (const layer of layers) {
					$map.removeLayer(layer.id);
				}
			}
			$map.removeSource(sourceId);

			// layerSpec = undefined;
			// sourceSpec = undefined;
			sourceId = undefined;
		}
		if (is_raster) {
			const data = await rasterTileData.add($map, defaultColormap);
			// layerSpec = data.layer;
			// sourceSpec = data.source;
			defaultColormap = data.colormap;
			sourceId = data.sourceId;
		} else {
			const data = await vectorTileData.add(
				$map,
				layerType,
				defaultColor,
				selectedVectorLayer.layer
			);
			// layerSpec = data.layer;
			// sourceSpec = data.source;
			defaultColor = data.color;
			sourceId = data.sourceId;
		}
	};
</script>

<svelte:window bind:innerHeight />

<div class="style-editor mt-1" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map"></div>
	<div class="editor">
		{#if !is_raster}
			{#if tilestatsLayers.length > 0}
				<div class="vector-config p-2">
					{#if tilestatsLayers.length > 1}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Please select a layer to edit</label>
							<div class="control">
								<div class="select is-link is-fullwidth">
									<select bind:value={selectedVectorLayer} on:change={handleLayerSelected}>
										{#each tilestatsLayers as layer}
											<option value={layer}>{layer.layer}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					{/if}
					<div class="mt-2">
						<LayerTypeSwitch bind:layer={selectedVectorLayer} bind:layerType />
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.style-editor {
		position: relative;
		width: 100%;

		.map {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.editor {
			background-color: white;
			position: absolute;
			top: 5px;
			left: 5px;
			z-index: 10;
		}
	}
</style>
