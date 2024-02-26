<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles, Permission } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import {
		fromLocalStorage,
		getFirstSymbolLayerId,
		isRgbRaster,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		LayerCreationInfo,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import RasterBandSelectbox from './RasterBandSelectbox.svelte';

	export let feature: DatasetFeature;
	export let showButtons = true;

	let config: UserConfig = $page.data.config;
	let layerCreationInfo: LayerCreationInfo;
	let metadata: RasterTileMetadata | VectorTileMetadata;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const stacType = tags?.find((tag) => tag.key === 'stac');

	let selectedVectorLayer: VectorLayerTileStatLayer;
	let selectedBand: string;
	let bands: string[];
	let isRgbTile = false;
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	let tilestatsLayers: VectorLayerTileStatLayer[] = [];

	const isCatalog =
		feature.properties.tags?.find((t) => t.key === 'stacApiType')?.value === 'catalog';

	const getMetadata = async () => {
		if (is_raster) {
			if (!isCatalog) {
				const rasterTile = new RasterTileData(feature);
				const rasterInfo = await rasterTile.getMetadata();
				metadata = rasterInfo;
				isRgbTile = isRgbRaster(rasterInfo.colorinterp);
				if (!isRgbTile) {
					if (metadata.band_metadata.length > 0) {
						bands = metadata.band_metadata.map((meta) => meta[0]) as string[];
						selectedBand = bands[0];
					}
				}
			}
		} else {
			const vectorTile = new VectorTileData(feature, config.FillExtrusionDefaultPitch);
			const vectorInfo = await vectorTile.getMetadata();
			metadata = vectorInfo;
			tilestatsLayers = vectorInfo.json?.tilestats?.layers;
			selectedVectorLayer = tilestatsLayers[0];
		}
	};

	let innerWidth = 0;

	const handleShowOnMap = async () => {
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

		// create layer info and add it to style and layerList
		if (is_raster) {
			// COG
			storageLayerList = [
				{
					id: layerCreationInfo.layer.id,
					name: feature.properties.name,
					info: layerCreationInfo.metadata,
					dataset: feature,
					colorMapName: layerCreationInfo.colormap_name,
					classificationMethod: layerCreationInfo.classification_method
				},
				...storageLayerList
			];

			let idx = storageMapStyle.layers.length - 1;

			const firstSymbolLayerId = getFirstSymbolLayerId(storageMapStyle.layers);
			if (firstSymbolLayerId) {
				idx = storageMapStyle.layers.findIndex((l) => l.id === firstSymbolLayerId);
			}
			storageMapStyle.layers.splice(idx, 0, layerCreationInfo.layer);

			if (!storageMapStyle.sources[layerCreationInfo.sourceId]) {
				storageMapStyle.sources[layerCreationInfo.sourceId] = layerCreationInfo.source;
			}
		} else {
			// vector data

			let name = `${feature.properties.name}`;
			if (tilestatsLayers?.length > 1) {
				name = `${selectedVectorLayer.layer} - ${name}`;
			}
			storageLayerList = [
				{
					id: layerCreationInfo.layer.id,
					name: name,
					info: layerCreationInfo.metadata,
					dataset: feature,
					colorMapName: layerCreationInfo.colormap_name,
					classificationMethod: layerCreationInfo.classification_method,
					classificationMethod_2: layerCreationInfo.classification_method_2
				},
				...storageLayerList
			];
			storageMapStyle.layers.push(layerCreationInfo.layer);

			if (!storageMapStyle.sources[layerCreationInfo.sourceId]) {
				storageMapStyle.sources[layerCreationInfo.sourceId] = layerCreationInfo.source;
			}
		}

		// save layer info to localstorage
		toLocalStorage(mapStyleIdStorageKey, storageMapStyleId);
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		goto('/maps/edit', { invalidateAll: true });
	};

	$: selectedVectorLayer, handleLayerTypeChanged();
	$: layerType, handleLayerTypeChanged();
	const handleLayerTypeChanged = () => {
		layerCreationInfo = undefined;
	};

	const handleLayerAdded = (e: { detail: LayerCreationInfo }) => {
		layerCreationInfo = e.detail;
	};

	onMount(() => {
		getMetadata();
	});
</script>

<svelte:window bind:innerWidth />

<div class="preview">
	{#if !is_raster}
		{#if tilestatsLayers.length > 0}
			<div class="vector-config p-2">
				{#if tilestatsLayers.length > 1}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a layer to preview</label>
						<div class="control">
							<div class="select is-link is-fullwidth">
								<select bind:value={selectedVectorLayer}>
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
		{#if selectedVectorLayer}
			{#key selectedVectorLayer}
				<MiniMap
					bind:feature
					isLoadMap={true}
					width="100%"
					height={innerWidth < 768 ? '200px' : '50vh'}
					layer={selectedVectorLayer}
					bind:metadata
					bind:layerType
					on:layerAdded={handleLayerAdded}
				/>
			{/key}
		{/if}
	{:else}
		{#if metadata && !isRgbTile && bands.length > 1}
			<div class="raster-config p-2">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select a raster band</label>
					<div class="control">
						<RasterBandSelectbox bind:metadata bind:selectedBand />
					</div>
				</div>
			</div>
		{/if}

		{#if isRgbTile || selectedBand}
			{#key selectedBand}
				<MiniMap
					bind:feature
					isLoadMap={true}
					width="100%"
					height={innerWidth < 768 ? '200px' : '50vh'}
					bind:metadata
					band={isRgbTile ? undefined : selectedBand}
					on:layerAdded={handleLayerAdded}
				/>
			{/key}
		{/if}
	{/if}

	{#if !stacType && showButtons}
		{#if layerCreationInfo}
			<div class="buttons mt-4">
				<button
					class="button is-primary is-uppercase has-text-weight-bold"
					on:click={handleShowOnMap}
				>
					Add to map
				</button>

				{#if feature.properties.permission > Permission.READ}
					<a
						class="button is-link is-uppercase has-text-weight-bold"
						href="/data/{feature.properties.id}/style/edit"
					>
						Change default appearance
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style lang="scss">
	.preview {
		position: relative;

		.raster-config,
		.vector-config {
			position: absolute;
			top: 15px;
			left: 15px;
			width: 50%;
			z-index: 10;
			background-color: rgba(255, 255, 255, 0.8);
		}
	}
</style>
