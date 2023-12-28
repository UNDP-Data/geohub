<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import Star from '$components/util/Star.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles, SdgLogos } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import {
		createAttributionFromTags,
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
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import type { StyleSpecification } from 'maplibre-gl';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';
	import RasterBandSelectbox from './RasterBandSelectbox.svelte';

	export let feature: DatasetFeature;
	export let showLicense = false;
	export let showDatatime = false;

	let config: UserConfig = $page.data.config;
	let layerCreationInfo: LayerCreationInfo;
	let metadata: RasterTileMetadata | VectorTileMetadata;

	const datasetLinks = feature.properties.links;
	const downloadUrl = datasetLinks.find((l) => l.rel === 'download')?.href;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags
		.filter((t) => t.key === 'sdg_goal')
		.sort((a, b) => parseInt(a.value) - parseInt(b.value));
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);

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

	const getFileSize = async (url: string) => {
		let bytes = 'N/A';
		const res = await fetch(url);
		if (res.ok) {
			const contentLength = res.headers.get('content-length');
			if (contentLength) {
				bytes = filesize(Number(contentLength), { round: 1 }) as string;
			}
		}
		return bytes;
	};

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
		goto('/maps', { invalidateAll: true });
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

<div class="p-0 py-2">
	<div class="columns m-0">
		<div class="column is-flex is-flex-direction-column">
			<div class="py-2">
				<Star
					bind:id={feature.properties.id}
					bind:isStar={feature.properties.is_star}
					bind:no_stars={feature.properties.no_stars}
					table="datasets"
				/>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Description</label>
				<div class="control">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(feature.properties.description)}
				</div>
			</div>
			{#if sdgs.length > 0}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">SDGs</label>
					<div class="control">
						<div class="sdg-grid">
							{#each sdgs as sdg}
								{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
								<figure
									class={`image is-48x48 is-flex is-align-items-center`}
									data-testid="icon-figure"
								>
									<img src={logo.icon} alt="SDG {logo.value}" title="SDG {logo.value}" />
								</figure>
							{/each}
						</div>
					</div>
				</div>
			{/if}
			{#if showLicense}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">License</label>
					<div class="control">
						{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
					</div>
				</div>
			{/if}
			<div class="columns is-mobile">
				<div class="column field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Source</label>
					<div class="control">
						<!-- eslint-disable svelte/no-at-html-tags -->
						{@html attribution}
					</div>
				</div>
				{#if unit}
					<div class="column field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Unit</label>
						<div class="control">
							{unit}
						</div>
					</div>
				{/if}
			</div>
			<div class="columns is-mobile">
				<div class="column field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Created by</label>
					<div class="control">
						{feature.properties.created_user}
					</div>
				</div>
				<div class="column field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Updated by</label>
					<div class="control">
						{feature.properties.updated_user}
					</div>
				</div>
			</div>
			{#if showDatatime}
				<div class="columns is-mobile is-flex">
					<div class="column field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Created at</label>
						<div class="control">
							<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
						</div>
					</div>
					<div class="column field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Updated at</label>
						<div class="control">
							<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
						</div>
					</div>
				</div>
			{/if}
			{#if downloadUrl}
				{@const filePath = new URL(downloadUrl).pathname.split('/')}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Dataset</label>
					<div class="control">
						{#await getFileSize(downloadUrl) then bytes}
							<div class="is-flex is-align-content-center">
								<DefaultLink
									href={downloadUrl}
									title={`${filePath[filePath.length - 1].split('.')[1].toUpperCase()} ${bytes}`}
									target=""
								>
									<i slot="content" class="fas fa-download has-text-primary pl-2"></i>
								</DefaultLink>
							</div>
						{/await}
					</div>
				</div>
			{/if}
		</div>
		<div class="column preview">
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
							height={innerWidth < 768 ? '200px' : '320px'}
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
					<MiniMap
						bind:feature
						isLoadMap={true}
						width="100%"
						height={innerWidth < 768 ? '200px' : '320px'}
						bind:metadata
						band={isRgbTile ? undefined : selectedBand}
						on:layerAdded={handleLayerAdded}
					/>
				{/if}
			{/if}

			{#if !stacType}
				{#if layerCreationInfo}
					<div class="mt-2">
						<button class="button is-primary is-medium" on:click={handleShowOnMap}
							><p class="has-text-weight-semibold">Show it on map</p></button
						>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.sdg-grid {
		display: flex;
		flex-direction: row;
		gap: 5px;
		flex-wrap: wrap;
	}

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
