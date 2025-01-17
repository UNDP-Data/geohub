<script lang="ts">
	import { page } from '$app/state';
	import RasterBandSelectbox from '$components/pages/data/datasets/RasterBandSelectbox.svelte';
	import RasterLegend from '$components/pages/map/layers/raster/RasterLegend.svelte';
	import VectorLegend from '$components/pages/map/layers/vector/VectorLegend.svelte';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { isRgbRaster } from '$lib/helper';
	import type { DatasetDefaultLayerStyle, Tag, VectorLayerSpecification } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		CLASSIFICATION_METHOD_CONTEXT_KEY_2,
		COLORMAP_NAME_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		RASTERRESCALE_CONTEXT_KEY,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createNumberOfClassesStore,
		createRasterRescaleStore
	} from '$stores';
	import {
		HeroHeader,
		MAPSTORE_CONTEXT_KEY,
		ModalTemplate,
		Notification,
		ShowDetails,
		createMapStore,
		getRandomColormap,
		type BreadcrumbPage,
		type RasterTileMetadata,
		type VectorLayerTileStatLayer,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import {
		FullscreenControl,
		Map,
		NavigationControl,
		type RasterLayerSpecification
	} from 'maplibre-gl';
	import { onMount, setContext } from 'svelte';
	import Time from 'svelte-time';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: data.feature.properties.name as string, url: `/data/${data.feature.properties.id}` },
		{ title: 'edit default appearance', url: page.url.href }
	]);

	let feature = data.feature;
	let config: UserConfig = data.config;
	let mapContainer: HTMLDivElement | undefined = $state();

	let isLoading = $state(false);
	let innerHeight: number = $state(0);

	let showDetails = $state(false);
	let deleteDialogOpen = $state(false);
	let isExpanded = $state(true);

	let vectorTileData: VectorTileData;
	let rasterTileData: RasterTileData;
	let vectorMetadata: VectorTileMetadata | undefined = $state();
	let rasterMetadata: RasterTileMetadata | undefined = $state();
	let defaultLayerStyle: DatasetDefaultLayerStyle | undefined = $state();

	let sourceId: string;
	let layerSpec: VectorLayerSpecification | RasterLayerSpecification | undefined = $state();

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	let selectedVectorLayer: VectorLayerTileStatLayer | undefined = $state();
	let selectedBand: string = $state('');
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | undefined = $state();
	let tilestatsLayers: VectorLayerTileStatLayer[] = $state([]);
	let isRgbTile = $state(false);
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

	const map = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, map);

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	// for color
	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	// for size/width
	const numberOfClassesStore2 = createNumberOfClassesStore();
	$numberOfClassesStore2 = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2, numberOfClassesStore2);

	// colormap for geometry
	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);

	// for color classification
	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);

	// value (icon size/line width) classification
	const classificationMethod2 = createClassificationMethodStore();
	$classificationMethod2 = page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY_2, classificationMethod2);

	const defaultColorStore = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY, defaultColorStore);

	onMount(() => {
		initialiseMap();
	});

	const initialiseMap = () => {
		if (!mapContainer) return;
		$map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 3
		});

		$map.addControl(new FullscreenControl(), 'top-right');
		$map.addControl(new NavigationControl(), 'bottom-right');
		isLoading = true;

		$map.once('load', () => {
			mapResize();

			getMetadata().then(() => {
				isLoading = false;
				if (is_raster) {
					handleBandSelected();
				} else {
					handleLayerSelected();
				}
			});
		});
	};

	const mapResize = () => {
		if (!$map) return;
		$map.redraw();
		$map.resize();
	};

	const handleLayerSelected = async () => {
		if (!$map) return;
		try {
			isLoading = true;

			$map.setStyle(MapStyles[0].uri);

			const data = await vectorTileData.add($map, layerType, selectedVectorLayer.layer);
			layerSpec = data.layer;
			sourceId = data.sourceId;
			vectorMetadata = data.metadata as VectorTileMetadata;
			$colorMapNameStore = data.colormap_name ?? getRandomColormap();
			$classificationMethod = data.classification_method;
			$classificationMethod2 = data.classification_method_2;
			defaultLayerStyle = data.defaultStyle;
		} finally {
			isLoading = false;
		}
	};

	// $: selectedBand, handleBandSelected();
	const handleBandSelected = async () => {
		if (!$map) return;

		try {
			isLoading = true;

			$map.setStyle(MapStyles[0].uri);

			let bandIndex = getSelectedBandIndex();
			if (bandIndex) {
				bandIndex = bandIndex - 1;
			}
			const data = await rasterTileData.add($map, bandIndex);
			layerSpec = data.layer;
			$colorMapNameStore = data.colormap_name ?? getRandomColormap();
			$classificationMethod = data.classification_method ?? config.ClassificationMethod;
			sourceId = data.sourceId;
			defaultLayerStyle = data.defaultStyle;
			rasterMetadata = data.metadata;

			// set rescale to context
			const sourceUrl = data.source.url ?? data.source.tiles[0];
			const srcUrlObj = new URL(sourceUrl);
			const rescaleString = srcUrlObj.searchParams.get('rescale');
			if (rescaleString) {
				const rescale = JSON.parse(`[${rescaleString}]`) as number[];
				$rescaleStore = rescale;
			}
		} finally {
			isLoading = false;
		}
	};

	const getSelectedBandIndex = () => {
		const bands = rasterMetadata.band_metadata.map((meta) => meta[0]) as string[];
		let bandIndex = undefined;
		if (!isRgbTile) {
			bandIndex = bands.findIndex((b) => b === selectedBand);
			if (bandIndex === -1) {
				bandIndex = undefined;
			} else {
				bandIndex = bandIndex + 1;
			}
		}
		return bandIndex;
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

			let layer_id = is_raster ? getSelectedBandIndex() : selectedVectorLayer.layer;

			const payload: DatasetDefaultLayerStyle = {
				dataset_id: feature.properties.id,
				layer_id: layer_id,
				layer_type: layerStyle.type,
				source: sourceStyle,
				style: layerStyle,
				colormap_name: $colorMapNameStore,
				classification_method: $classificationMethod,
				classification_method_2: $classificationMethod2
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
						selectedBand ? `${selectedBand}` : selectedVectorLayer.layer
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

			let layer_id = is_raster ? getSelectedBandIndex() : selectedVectorLayer.layer;

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
					}, ${selectedBand ? `${selectedBand}` : selectedVectorLayer.layer})`
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

	let expanded: { [key: string]: boolean } = $state({});
	// to allow only an accordion to be expanded
	let expandedDatasetId: string = $state('');
	let mapHeight = $derived(
		innerHeight * 0.5 < 300 ? 300 : innerHeight * 0.5 > 700 ? 700 : innerHeight * 0.5
	);
	$effect(() => {
		mapResize();
	});
	$effect(() => {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	});
</script>

<svelte:window bind:innerHeight />

<HeroHeader title="Edit default appearance" bind:breadcrumbs />

<div class="m-6">
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

	<div class="editor-container">
		<div bind:this={mapContainer} class="map" style="height: {mapHeight}px;"></div>
		<div class="editor">
			<div class="legend-header has-background-light is-flex is-align-items-center px-2">
				<span class="is-size-6">Default style editor</span>
				<div class="header-buttons pl-2">
					<button
						class="button chevron-button {isExpanded ? 'is-expanded' : ''}"
						onclick={() => {
							isExpanded = !isExpanded;
						}}
						aria-label="expand"
					>
						<span class="icon is-small">
							<i class="fa-solid fa-chevron-down"></i>
						</span>
					</button>
				</div>
			</div>
			<div class="editor-contents p-2" hidden={!isExpanded} style="max-height: {mapHeight - 50}px;">
				<div hidden={!isLoading}><Loader size="medium" /></div>
				<div hidden={isLoading}>
					{#if !is_raster}
						{#if tilestatsLayers && tilestatsLayers.length > 0}
							<div class="vector-config p-2">
								{#if tilestatsLayers.length > 1}
									<div class="field">
										<!-- svelte-ignore a11y_label_has_associated_control -->
										<label class="label">Please select a layer</label>
										<div class="control">
											<div class="select is-link is-fullwidth">
												<select
													bind:value={selectedVectorLayer}
													onchange={handleLayerSelected}
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
									<LayerTypeSwitch
										bind:layer={selectedVectorLayer as VectorLayerTileStatLayer}
										bind:layerType={layerType as 'point' | 'heatmap' | 'polygon' | 'linestring'}
										onchange={handleLayerSelected}
									/>
								</div>
							</div>
						{/if}
					{:else if is_raster && rasterMetadata && !isRgbTile}
						<div class="field">
							<!-- svelte-ignore a11y_label_has_associated_control -->
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

					<div class="layer-editor">
						{#if layerSpec}
							{#if is_raster}
								{#if isRgbTile || (!isRgbTile && selectedBand)}
									<RasterLegend
										bind:layerId={layerSpec.id}
										bind:metadata={rasterMetadata}
										bind:tags={feature.properties.tags}
									/>
								{/if}
							{:else if isLoading}
								<div class="is-flex is-justify-content-center">
									<Loader size="small" />
								</div>
							{:else}
								<VectorLegend
									bind:layerId={layerSpec.id}
									bind:metadata={vectorMetadata}
									tags={feature.properties.tags as Tag[]}
								/>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if layerSpec}
		<div class="mt-3 buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isLoading ? 'is-loading' : ''}"
				onclick={handleSaved}
				disabled={isLoading}
			>
				Save
			</button>
			{#if defaultLayerStyle?.created_user}
				<button
					class="button is-link is-uppercase has-text-weight-bold {isLoading ? 'is-loading' : ''}"
					onclick={() => (deleteDialogOpen = true)}
					disabled={isLoading}
				>
					Delete
				</button>
			{/if}
		</div>
	{/if}

	<ModalTemplate title="Delete default layer style" bind:show={deleteDialogOpen}>
		{#snippet content()}
			<div>
				Are you sure deleting the following default layer style from the database?
				<br />
				Please click <b>Delete</b>
				button if you wish deleting.
				<br />
				<p>Dateset name: <b>{feature.properties.name}</b></p>
				{#if selectedBand || selectedVectorLayer}
					<p class="is-uppercase">
						Layer name: <b>{selectedBand ? `${selectedBand}` : selectedVectorLayer.layer}</b>
					</p>
				{/if}
			</div>
		{/snippet}
		{#snippet buttons()}
			<div class="buttons">
				<button
					class="button is-primary is-uppercase has-text-weight-bold {isLoading
						? 'is-loading'
						: ''}"
					onclick={handleDeleted}
					disabled={isLoading}
				>
					Delete
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	$width: 400px;

	.editor-container {
		position: relative;

		.map {
			position: relative;
			width: 100%;
		}

		.editor {
			background-color: white;
			position: absolute;
			top: 5px;
			left: 5px;
			width: $width;
			z-index: 10;

			:global(.loader) {
				margin-left: auto;
				margin-right: auto;
			}

			.legend-header {
				.header-buttons {
					margin-left: auto;

					.chevron-button {
						-webkit-transition: all 0.3s ease;
						-moz-transition: all 0.3s ease;
						-ms-transition: all 0.3s ease;
						-o-transition: all 0.3s ease;
						transition: all 0.3s ease;

						&.is-expanded {
							transform: rotate(-180deg);
							-webkit-transform: rotate(-180deg);
							-moz-transform: rotate(-180deg);
							-ms-transform: rotate(-180deg);
							-o-transform: rotate(-180deg);
							transition: rotateZ(-180deg);
						}
					}
					.button {
						border: none;
						background: transparent;
					}
				}
			}

			.editor-contents {
				width: $width;
				overflow-y: auto;
			}
		}
	}
</style>
