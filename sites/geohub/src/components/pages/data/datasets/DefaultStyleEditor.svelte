<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import Notification from '$components/util/Notification.svelte';
	import ShowDetails from '$components/util/ShowDetails.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import {
		getDefaltLayerStyle,
		getRandomColormap,
		getSpriteImageList,
		handleEnterKey,
		isRgbRaster
	} from '$lib/helper';
	import type {
		DatasetDefaultLayerStyle,
		DatasetFeature,
		RasterTileMetadata,
		VectorLayerSpecification,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		RASTERRESCALE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createLegendReadonlyStore,
		createMapStore,
		createNumberOfClassesStore,
		createRasterRescaleStore,
		createSpriteImageStore,
		type LegendReadonlyStore,
		type SpriteImageStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { Map, NavigationControl, type RasterLayerSpecification } from 'maplibre-gl';
	import { onMount, setContext } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { fade } from 'svelte/transition';
	import RasterBandSelectbox from './RasterBandSelectbox.svelte';

	const map = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, map);

	const spriteImageList: SpriteImageStore = createSpriteImageStore();
	setContext(SPRITEIMAGE_CONTEXT_KEY, spriteImageList);

	export let feature: DatasetFeature;

	let config: UserConfig = $page.data.config;
	let mapContainer: HTMLDivElement;

	let isLoading = false;
	let innerHeight: number;
	let contentHeight: number;
	$: minMapHeight = innerHeight * 0.5;
	$: mapHeight = contentHeight
		? contentHeight < minMapHeight
			? minMapHeight
			: contentHeight
		: innerHeight * 0.5;
	let showDetails = false;
	let deleteDialogOpen = false;

	let vectorTileData: VectorTileData;
	let rasterTileData: RasterTileData;
	let vectorMetadata: VectorTileMetadata;
	let rasterMetadata: RasterTileMetadata;
	let defaultLayerStyle: DatasetDefaultLayerStyle;

	let sourceId: string;
	let layerSpec: VectorLayerSpecification | RasterLayerSpecification;

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	let selectedVectorLayer: VectorLayerTileStatLayer;
	let selectedBand: string;
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';
	let tilestatsLayers: VectorLayerTileStatLayer[] = [];
	let isRgbTile = false;
	const getMetadata = async () => {
		if (is_raster) {
			rasterTileData = new RasterTileData(feature);
			rasterMetadata = await rasterTileData.getMetadata();
			isRgbTile = isRgbRaster(rasterMetadata.colorinterp) ?? false;
		} else {
			vectorTileData = new VectorTileData(feature, config.FillExtrusionDefaultPitch);
			vectorMetadata = await vectorTileData.getMetadata();
			tilestatsLayers = vectorMetadata.json?.tilestats?.layers;
			selectedVectorLayer = tilestatsLayers[0];
		}
	};

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	// for color
	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	// for size/width
	const numberOfClassesStore2 = createNumberOfClassesStore();
	$numberOfClassesStore2 = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2, numberOfClassesStore2);

	const colorMapNameStore = createColorMapNameStore();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);

	const classificationMethod = createClassificationMethodStore();
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);

	const defaultColorStore = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY, defaultColorStore);

	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	onMount(() => {
		initialiseMap();
	});

	const initialiseMap = () => {
		$map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 3
		});

		$map.addControl(new NavigationControl(), 'bottom-right');
		isLoading = true;

		$map.once('load', () => {
			mapResize();

			const spriteUrl = $map.getStyle().sprite as string;
			getSpriteImageList(spriteUrl)
				.then((iconList) => {
					spriteImageList.update(() => iconList);

					return getMetadata();
				})
				.then(() => {
					isLoading = false;
					if (is_raster) {
						handleBandSelected();
					} else {
						handleLayerSelected();
					}
				});
		});
	};

	$: mapHeight, mapResize();
	const mapResize = () => {
		if (!$map) return;
		$map.redraw();
		$map.resize();
	};

	$: layerType, handleLayerSelected();

	const handleLayerSelected = async () => {
		if (!$map) return;
		try {
			isLoading = true;

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

				layerSpec = undefined;
				sourceId = undefined;
			}

			if (!is_raster) {
				const data = await vectorTileData.add($map, layerType, selectedVectorLayer.layer);
				layerSpec = data.layer;
				sourceId = data.sourceId;
				vectorMetadata = data.metadata as VectorTileMetadata;
				$colorMapNameStore = data.colormap_name ?? getRandomColormap();
				$classificationMethod = data.classification_method;

				defaultLayerStyle = await getDefaltLayerStyle(
					feature,
					selectedVectorLayer.layer,
					layerSpec.type
				);
			}
		} finally {
			isLoading = false;
		}
	};

	// $: selectedBand, handleBandSelected();
	const handleBandSelected = async () => {
		if (!$map) return;

		try {
			isLoading = true;

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

				layerSpec = undefined;
				sourceId = undefined;
			}

			if (is_raster) {
				const bandIndex = isRgbTile ? undefined : parseInt(selectedBand) - 1;
				const data = await rasterTileData.add($map, bandIndex);
				layerSpec = data.layer;
				$colorMapNameStore = data.colormap_name ?? getRandomColormap();
				$classificationMethod = data.classification_method ?? config.ClassificationMethod;
				sourceId = data.sourceId;

				defaultLayerStyle = await getDefaltLayerStyle(feature, selectedBand, layerSpec.type);
				rasterMetadata = defaultLayerStyle.metadata;
			}
		} finally {
			isLoading = false;
		}
	};

	const handleSaved = async () => {
		try {
			isLoading = true;

			if (!layerSpec) return;
			const style = $map.getStyle();
			const layerStyle = style.layers.find((l) => l.id === layerSpec.id) as
				| RasterLayerSpecification
				| VectorLayerSpecification;
			const sourceStyle = style.sources[sourceId];
			if (!(layerStyle && sourceStyle)) return;

			let layer_id = is_raster ? rasterMetadata.active_band_no : selectedVectorLayer.layer;

			const payload: DatasetDefaultLayerStyle = {
				dataset_id: feature.properties.id,
				layer_id: layer_id,
				layer_type: layerStyle.type,
				source: sourceStyle,
				style: layerStyle,
				colormap_name: $colorMapNameStore,
				classification_method: $classificationMethod
			};

			const res = await fetch(
				`/api/datasets/${payload.dataset_id}/style/${payload.layer_id}/${payload.layer_type}`,
				{
					method: 'POST',
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				defaultLayerStyle = await res.json();
				toast.push(
					`Default style for the dataset was saved successfully (${feature.properties.name}, ${
						selectedBand ? `B${selectedBand}` : selectedVectorLayer.layer
					})`
				);
			} else {
				toast.push(`Failed to save (${res.status}: ${res.statusText})`);
			}
		} finally {
			isLoading = false;
		}
	};

	const handleDeleted = async () => {
		if (!layerSpec) return;
		try {
			isLoading = true;

			let layer_id = is_raster ? selectedBand : selectedVectorLayer.layer;

			const res = await fetch(
				`/api/datasets/${feature.properties.id}/style/${layer_id}/${layerSpec.type}`,
				{
					method: 'DELETE'
				}
			);

			if (res.ok) {
				toast.push(
					`Deleted default style for the dataset was saved successfully (${
						feature.properties.name
					}, ${selectedBand ? `B${selectedBand}` : selectedVectorLayer.layer})`
				);
				defaultLayerStyle = undefined;
			} else {
				toast.push(`Failed to delete (${res.status}: ${res.statusText})`);
			}
		} finally {
			isLoading = false;
			deleteDialogOpen = false;
		}
	};
</script>

<svelte:window bind:innerHeight />

{#if defaultLayerStyle}
	<div class="my-2">
		<Notification type="info" showCloseButton={false}>
			{#if defaultLayerStyle.created_user}
				<p class="is-size-5">Default style in selected dataset/layer exists in the database.</p>
				<ShowDetails bind:show={showDetails} />
				{#if showDetails}
					{#if defaultLayerStyle.created_user}
						<p class="is-size-6">Created by: {defaultLayerStyle.created_user}</p>
						<p class="is-size-6">
							Created at: <Time
								timestamp={defaultLayerStyle.createdat}
								format="HH:mm, MM/DD/YYYY"
							/>
						</p>
					{/if}
					{#if defaultLayerStyle.updated_user}
						<p class="is-size-6">Modified by: {defaultLayerStyle.updated_user}</p>
						<p class="is-size-6">
							Modified at: <Time
								timestamp={defaultLayerStyle.updatedat}
								format="HH:mm, MM/DD/YYYY"
							/>
						</p>
					{/if}
				{/if}
			{:else}
				<p class="is-size-5">
					Default style is not registered in the database. The style was created randomly. Please
					change and register it to the database.
				</p>
			{/if}
		</Notification>
	</div>
{/if}

<div class="columns">
	<div class="column is-6">
		<div bind:this={mapContainer} class="map" style="height: {mapHeight}px;" />
	</div>
	<div class="column is-6">
		<div class="editor" bind:clientHeight={contentHeight}>
			<div hidden={!isLoading}><Loader size="large" /></div>
			<div hidden={isLoading}>
				{#if !is_raster}
					{#if tilestatsLayers && tilestatsLayers.length > 0}
						<div class="vector-config p-2">
							{#if tilestatsLayers.length > 1}
								<div class="field">
									<!-- svelte-ignore a11y-label-has-associated-control -->
									<label class="label">Please select a layer</label>
									<div class="control">
										<div class="select is-link is-fullwidth">
											<select
												bind:value={selectedVectorLayer}
												on:change={handleLayerSelected}
												disabled={isLoading}
											>
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
				{:else if is_raster && rasterMetadata && !isRgbTile}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a raster band</label>
						<div class="control">
							<RasterBandSelectbox
								bind:metadata={rasterMetadata}
								bind:selectedBand
								on:change={handleBandSelected}
							/>
						</div>
					</div>
				{/if}

				<div class="layer-editor p-4">
					{#if layerSpec}
						{#if is_raster}
							{#if isRgbTile || (!isRgbTile && selectedBand)}
								<RasterLegend
									bind:layerId={layerSpec.id}
									bind:metadata={rasterMetadata}
									bind:tags={feature.properties.tags}
								/>
							{/if}
						{:else}
							<VectorLegend bind:layerId={layerSpec.id} bind:metadata={vectorMetadata} />
						{/if}

						<div class="mt-3 {defaultLayerStyle ? 'footer-buttons' : ''}">
							<button
								class="button is-primary {isLoading ? 'is-loading' : ''} is-fullwidth"
								on:click={handleSaved}
								disabled={isLoading}
							>
								<span class="icon">
									<i class="fa-solid fa-floppy-disk"></i>
								</span>
								<span>Save</span>
							</button>
							{#if defaultLayerStyle}
								<button
									class="button is-link {isLoading ? 'is-loading' : ''} is-fullwidth"
									on:click={() => (deleteDialogOpen = true)}
									disabled={isLoading}
								>
									<span class="icon">
										<i class="fa-solid fa-trash"></i>
									</span>
									<span>Delete</span>
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="modal {deleteDialogOpen ? 'is-active' : ''}" data-testid="modal-dialog" transition:fade>
	<div
		class="modal-background"
		role="button"
		tabindex="-1"
		on:click={() => (deleteDialogOpen = false)}
		on:keydown={handleEnterKey}
	/>
	<div class="modal-card">
		<header class="modal-card-head">
			<span class="modal-card-title">Delete default layer style</span>
			<button
				class="delete"
				aria-label="close"
				title="Close Delete Layer Button"
				on:click={() => {
					deleteDialogOpen = false;
				}}
			/>
		</header>
		<section class="modal-card-body">
			Are you sure deleting the following default layer style from the database? Please click <b
				>Delete</b
			>
			button if you wish deleting.
			<br />
			<p>Dateset name: <b>{feature.properties.name}</b></p>
			{#if selectedBand || selectedVectorLayer}
				<p>Layer name: <b>{selectedBand ? `B${selectedBand}` : selectedVectorLayer.layer}</b></p>
			{/if}
		</section>
		<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
			<button
				class="button is-link {isLoading ? 'is-loading' : ''}"
				on:click={() => {
					deleteDialogOpen = false;
				}}
				disabled={isLoading}
			>
				<span class="icon">
					<i class="fa-solid fa-xmark"></i>
				</span>
				<span>Cancel</span>
			</button>
			<button
				class="button is-primary {isLoading ? 'is-loading' : ''}"
				on:click={handleDeleted}
				disabled={isLoading}
			>
				<span class="icon">
					<i class="fa-solid fa-trash"></i>
				</span>
				<span>Delete</span>
			</button>
		</footer>
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.editor {
		background-color: white;
		position: relative;
		height: fit-content;
		width: 100%;

		:global(.loader) {
			margin-left: auto;
			margin-right: auto;
		}

		.footer-buttons {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 5px;
		}
	}
</style>
