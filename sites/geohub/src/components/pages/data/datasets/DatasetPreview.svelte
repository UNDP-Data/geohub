<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { addDataToLocalStorage, getFirstSymbolLayerId, isRgbRaster } from '$lib/helper';
	import type { DatasetFeature, Layer, LayerCreationInfo } from '$lib/types';
	import type {
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import RasterBandSelectbox from './RasterBandSelectbox.svelte';

	interface Props {
		feature: DatasetFeature;
		showButtons?: boolean;
		height?: string;
	}

	let {
		feature = $bindable(),
		showButtons = $bindable(true),
		height = $bindable('')
	}: Props = $props();

	let config: UserConfig = page.data.config;
	let layerCreationInfo: LayerCreationInfo | undefined = $state();
	let metadata: RasterTileMetadata | VectorTileMetadata | undefined = $state();

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const stacType = tags?.find((tag) => tag.key === 'stac');

	let selectedVectorLayer: VectorLayerTileStatLayer | undefined = $state();
	let selectedBand: string = $state('');
	let bands: string[] | undefined = $state();
	let isRgbTile = $state(false);
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | undefined = $state();

	let tilestatsLayers: VectorLayerTileStatLayer[] = $state([]);

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

	let innerWidth = $state(0);

	const handleShowOnMap = async () => {
		const mapUrl = await addDataToLocalStorage(
			page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				// create layer info and add it to style and layerList
				if (is_raster) {
					// COG
					layers = [
						{
							id: layerCreationInfo.layer.id,
							name: feature.properties.name,
							info: layerCreationInfo.metadata,
							dataset: feature,
							colorMapName: layerCreationInfo.colormap_name,
							classificationMethod: layerCreationInfo.classification_method
						},
						...layers
					];

					let idx = style.layers.length - 1;

					const firstSymbolLayerId = getFirstSymbolLayerId(style.layers);
					if (firstSymbolLayerId) {
						idx = style.layers.findIndex((l) => l.id === firstSymbolLayerId);
					}
					style.layers.splice(idx, 0, layerCreationInfo.layer);

					if (!style.sources[layerCreationInfo.sourceId]) {
						style.sources[layerCreationInfo.sourceId] = layerCreationInfo.source;
					}
				} else {
					// vector data

					let name = `${feature.properties.name}`;
					if (tilestatsLayers?.length > 1) {
						name = `${selectedVectorLayer.layer} - ${name}`;
					}
					layers = [
						{
							id: layerCreationInfo.layer.id,
							name: name,
							info: layerCreationInfo.metadata,
							dataset: feature,
							colorMapName: layerCreationInfo.colormap_name,
							classificationMethod: layerCreationInfo.classification_method,
							classificationMethod_2: layerCreationInfo.classification_method_2
						},
						...layers
					];
					style.layers.push(layerCreationInfo.layer);

					if (!style.sources[layerCreationInfo.sourceId]) {
						style.sources[layerCreationInfo.sourceId] = layerCreationInfo.source;
					}
				}
				return { layers, style, styleId };
			}
		);

		// move to /map page
		goto(mapUrl.url, { invalidateAll: true });
	};

	const handleLayerTypeChanged = () => {
		layerCreationInfo = undefined;
	};

	const handleLayerAdded = (data: LayerCreationInfo) => {
		layerCreationInfo = data;
	};

	onMount(() => {
		getMetadata();
	});
</script>

<svelte:window bind:innerWidth />

<div class="preview">
	{#if !is_raster}
		{#if tilestatsLayers?.length > 0}
			<div
				class="vector-config p-2"
				hidden={tilestatsLayers?.length === 1 &&
					selectedVectorLayer?.geometry.toLowerCase() === 'linestring'}
			>
				{#if tilestatsLayers.length > 1}
					<div class="field">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="label">Please select a layer to preview</label>
						<div class="control">
							<div class="select is-link is-fullwidth">
								<select bind:value={selectedVectorLayer} onchange={handleLayerTypeChanged}>
									{#each tilestatsLayers as layer (layer.layer)}
										<option value={layer}>{layer.layer}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
				{/if}
				<div class="mt-2">
					<LayerTypeSwitch
						bind:layer={selectedVectorLayer as VectorLayerTileStatLayer}
						bind:layerType={layerType as 'point' | 'heatmap' | 'polygon' | 'linestring'}
						size="small"
						onchange={handleLayerTypeChanged}
					/>
				</div>
			</div>
		{/if}
		{#if selectedVectorLayer}
			{#key selectedVectorLayer}
				{#key layerType}
					<MiniMap
						bind:feature
						isLoadMap={true}
						width="100%"
						height={height?.length > 0 ? height : innerWidth < 768 ? '200px' : '50vh'}
						layer={selectedVectorLayer}
						bind:metadata
						bind:layerType
						onLayerAdded={handleLayerAdded}
					/>
				{/key}
			{/key}
		{/if}
	{:else}
		{#if metadata && !isRgbTile && bands.length > 1}
			<div class="raster-config p-2">
				<div class="field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
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
					height={height?.length > 0 ? height : innerWidth < 768 ? '200px' : '50vh'}
					bind:metadata
					band={isRgbTile ? undefined : selectedBand}
					onLayerAdded={handleLayerAdded}
				/>
			{/key}
		{/if}
	{/if}

	{#if !stacType && showButtons}
		{#if layerCreationInfo}
			<div class="buttons mt-4">
				<button class="button is-link is-uppercase has-text-weight-bold" onclick={handleShowOnMap}>
					Add to map
				</button>
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
			width: 300px;
			z-index: 10;
			background-color: rgba(255, 255, 255, 0.8);
		}
	}
</style>
