<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import Star from '$components/util/Star.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { MapStyles, TabNames } from '$lib/config/AppConfig';
	import {
		createAttributionFromTags,
		fromLocalStorage,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import type { StyleSpecification } from 'maplibre-gl';
	import { marked } from 'marked';
	import Time from 'svelte-time';

	export let feature: DatasetFeature;
	export let showLicense = false;
	export let showDatatime = false;

	let metadata: RasterTileMetadata | VectorTileMetadata;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;

	const datasetLinks = feature.properties.links;
	const downloadUrl = datasetLinks.find((l) => l.rel === 'download')?.href;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags.filter((t) => t.key === 'sdg_goal');
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const stacType = tags?.find((tag) => tag.key === 'stac');

	let selectedVectorLayer: VectorLayerTileStatLayer;
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	let tilestatsLayers: VectorLayerTileStatLayer[] = [];
	const getMetadata = async () => {
		if (is_raster) return;
		const vectorTile = new VectorTileData(feature);
		const res = await vectorTile.getMetadata();
		tilestatsLayers = res.metadata.json?.tilestats?.layers;
		selectedVectorLayer = tilestatsLayers[0];
	};
	getMetadata();

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
			if (stacType) {
				// STAC
				// it will be redirected to /map page with default query searching.
				// data page is unable to procude mosaicjson since it requires a map to get map extent
				const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}?query=${
					feature.properties.name
				}&activetab=${TabNames.DATA}`;
				document.location = url;
				return;
			} else {
				// COG
				const rasterInfo = metadata as RasterTileMetadata;
				const rasterTile = new RasterTileData(feature, rasterInfo);
				const data = await rasterTile.add(undefined);
				storageLayerList = [
					{
						id: data.layer.id,
						name: feature.properties.name,
						info: data.metadata,
						dataset: feature,
						colorMapName: data.colormap,
						classificationMethod: data.classification_method
					},
					...storageLayerList
				];

				let idx = storageMapStyle.layers.length - 1;
				for (const layer of storageMapStyle.layers) {
					if (layer.type === 'symbol') {
						idx = storageMapStyle.layers.indexOf(layer);
						break;
					}
				}
				storageMapStyle.layers.splice(idx, 0, data.layer);

				if (!storageMapStyle.sources[data.sourceId]) {
					storageMapStyle.sources[data.sourceId] = data.source;
				}
			}
		} else {
			// vector data
			const vectorInfo = metadata as VectorTileMetadata;
			const vectorTile = new VectorTileData(feature, vectorInfo);
			const data = await vectorTile.add(undefined, layerType, selectedVectorLayer.layer);

			let name = `${feature.properties.name}`;
			if (tilestatsLayers?.length > 1) {
				name = `${selectedVectorLayer.layer} - ${name}`;
			}
			storageLayerList = [
				{
					id: data.layer.id,
					name: name,
					info: data.metadata,
					dataset: feature,
					colorMapName: data.colormap_name,
					classificationMethod: data.classification_method
				},
				...storageLayerList
			];
			storageMapStyle.layers.push(data.layer);

			if (!storageMapStyle.sources[data.sourceId]) {
				storageMapStyle.sources[data.sourceId] = data.source;
			}
		}

		// save layer info to localstorage
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}`;
		goto(url, { invalidateAll: true });
	};
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
								<figure
									class={`image is-48x48 is-flex is-align-items-center`}
									data-testid="icon-figure"
								>
									<img
										src="/assets/sdgs/{sdg.value}.png"
										alt="SDG {sdg.value}"
										title="SDG {sdg.value}"
									/>
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
							bind:defaultColor
							bind:defaultColormap
							bind:layerType
						/>
					{/key}
				{/if}
			{:else}
				<MiniMap
					bind:feature
					isLoadMap={true}
					width="100%"
					height={innerWidth < 768 ? '200px' : '320px'}
					bind:metadata
					bind:defaultColor
					bind:defaultColormap
				/>
			{/if}

			{#if !stacType}
				<div class="mt-2">
					<button class="button is-primary is-medium" on:click={handleShowOnMap}
						><p class="has-text-weight-semibold">Show it on map</p></button
					>
				</div>
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
