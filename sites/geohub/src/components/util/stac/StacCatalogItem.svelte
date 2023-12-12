<script lang="ts">
	import RasterBandSelectbox from '$components/pages/data/datasets/RasterBandSelectbox.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import { clean, isRgbRaster } from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		LayerCreationInfo,
		RasterTileMetadata,
		StacAsset,
		StacItemFeature
	} from '$lib/types';
	import { Accordion, Loader } from '@undp-data/svelte-undp-design';
	import { Map, NavigationControl, Popup, type LngLatLike } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let url: string;
	export let collectionUrl: string;
	export let height = 0;

	const metadataProps = [
		'platform',
		'datetime',
		'gsd',
		'ard_metadata_version',
		'catalog_id',
		'utm_zone',
		'quadkey',
		'proj:epsg'
	];
	const viewgeometryProps = [
		'view:off_nadir',
		'view:azimuth',
		'view:incidence_angle',
		'view:sun_azimuth',
		'view:sun_elevation'
	];

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
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
	}

	let isInitialising: Promise<StacItemFeature>;
	let itemFeature: StacItemFeature;
	let selectedAssetName: string;

	let rasterTile: RasterTileData;
	let metadata: RasterTileMetadata;
	let isRgbTile = false;
	let selectedBand = '';
	let layerData: LayerCreationInfo;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;
	let isLoading = false;

	let popup: Popup | undefined;
	let popupContainer: HTMLDivElement;
	let datasetFeature: DatasetFeature;

	onMount(() => {
		isInitialising = initialise();
	});

	const initialise = async () => {
		itemFeature = await fetchItem(url);
		expanded['preview'] = true;
		return itemFeature;
	};

	const fetchItem = async (itemUrl: string) => {
		const res = await fetch(itemUrl);
		const json: StacItemFeature = await res.json();
		return json;
	};

	$: if (mapContainer) {
		initialiseMap();
	}

	const initialiseMap = () => {
		const center = [
			(itemFeature.bbox[0] + itemFeature.bbox[2]) / 2,
			(itemFeature.bbox[1] + itemFeature.bbox[3]) / 2
		];
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [center[0], center[1]],
			zoom: 3
		});

		map.addControl(new NavigationControl(), 'bottom-left');

		map.once('load', () => {
			map.resize();
			map.redraw();
		});

		map.once('styledata', () => {
			const layerId = itemFeature.id;

			map.addSource(layerId, {
				type: 'geojson',
				data: itemFeature,
				promoteId: 'id'
			});
			map.addLayer({
				id: `${layerId}-fill`,
				type: 'fill',
				source: layerId,
				paint: {
					'fill-color': [
						'case',
						['boolean', ['feature-state', 'click'], false],
						'rgb(128,128,0)',
						'rgb(0,110,181)'
					],
					'fill-opacity': 0.1,
					'fill-outline-color': [
						'case',
						['boolean', ['feature-state', 'click'], false],
						'rgb(128,128,0)',
						'rgb(0,110,181)'
					]
				}
			});
			map.addLayer({
				id: `${layerId}-line`,
				type: 'line',
				source: layerId,
				paint: {
					'line-color': [
						'case',
						['boolean', ['feature-state', 'click'], false],
						'rgb(128,128,0)',
						'rgb(0,110,181)'
					],
					'line-width': 4
				}
			});

			map.fitBounds([
				[itemFeature.bbox[0], itemFeature.bbox[1]],
				[itemFeature.bbox[2], itemFeature.bbox[3]]
			]);

			// if there is an asset named 'visual' or 'preview', use it for default asset
			const visualIndex = Object.keys(itemFeature.assets).findIndex(
				(key) =>
					key.toLowerCase().indexOf('visual') !== -1 || key.toLowerCase().indexOf('preview') !== -1
			);
			if (visualIndex !== -1) {
				selectedAssetName = Object.keys(itemFeature.assets)[visualIndex];
			}
			handleSelectAsset();
		});
	};

	const handleSelectAsset = async () => {
		rasterTile = undefined;
		metadata = undefined;
		isRgbTile = undefined;
		selectedBand = undefined;
		if (popup) {
			popup.remove();
			popup = undefined;
		}

		if (!selectedAssetName) return;

		isLoading = true;

		try {
			const apiUrl = `/api/stac/catalog/${stacId}/item?url=${url}&asset=${selectedAssetName}&collection=${collectionUrl}`;
			const res = await fetch(apiUrl);
			datasetFeature = await res.json();

			rasterTile = new RasterTileData(datasetFeature);
			metadata = await rasterTile.getMetadata();
			isRgbTile = isRgbRaster(metadata.colorinterp) ?? false;
			if (isRgbTile) {
				await addLayerToMap();
			}
		} finally {
			isLoading = false;
		}
	};

	const handleBandSelected = async () => {
		isLoading = true;

		try {
			await addLayerToMap();
		} finally {
			isLoading = false;
		}
	};

	const addLayerToMap = async () => {
		if (!rasterTile) return;

		if (layerData) {
			if (map.getLayer(layerData.layer.id)) {
				map.removeLayer(layerData.layer.id);
			}
			if (map.getSource(layerData.sourceId)) {
				map.removeSource(layerData.sourceId);
			}
		}

		const bandIndex = isRgbTile ? undefined : parseInt(selectedBand) - 1;
		layerData = await rasterTile.add(map, bandIndex);

		addPopup();
	};

	const getBandDescription = (asset: StacAsset) => {
		const bands = [];
		if (asset['eo:bands']) {
			asset['eo:bands'].forEach((b) => {
				bands.push({
					name: b.common_name ?? b.name,
					description: b.description
				});
			});
		} else if (asset['raster:bands']) {
			asset['raster:bands'].forEach((b) => {
				bands.push({
					name: b.name,
					description: b.description
				});
			});
		}
		return bands;
	};

	const addPopup = () => {
		if (!itemFeature) return;
		if (!selectedAssetName) return;

		if (popup) {
			popup.remove();
			popup = undefined;
		}
		const lngLat: LngLatLike = [
			(itemFeature.bbox[0] + itemFeature.bbox[2]) / 2,
			(itemFeature.bbox[1] + itemFeature.bbox[3]) / 2
		];
		popup = new Popup({ closeOnClick: false, closeButton: false })
			.setLngLat(lngLat)
			.setMaxWidth('400px')
			.setDOMContent(popupContainer)
			.addTo(map);
	};

	const handleShowOnMap = () => {
		isLoading = true;
		try {
			const data: LayerCreationInfo & { geohubLayer?: Layer } = layerData;

			data.geohubLayer = {
				id: data.layer.id,
				name: datasetFeature.properties.name,
				info: data.metadata,
				dataset: datasetFeature,
				colorMapName: data.colormap_name
			};
			dispatch('dataAdded', {
				layers: [data]
			});
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:window bind:innerHeight />

{#await isInitialising}
	<Loader size="small" />
{:then}
	{#if itemFeature}
		{@const metaparams = metadataProps.filter(
			(prop) => prop in itemFeature.properties && itemFeature.properties[prop]
		)}
		{@const viewparams = viewgeometryProps.filter(
			(prop) => prop in itemFeature.properties && itemFeature.properties[prop]
		)}
		{#if metaparams.length > 0}
			<Accordion headerTitle="metadata" bind:isExpanded={expanded['metadata']}>
				<div class="p-4" slot="content">
					<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
						<thead>
							<th>Parameter</th>
							<th>Value</th>
						</thead>
						<tbody>
							{#each metadataProps as prop}
								{@const value = itemFeature.properties[prop]}
								{#if value}
									<tr>
										<td>{clean(prop)}</td>
										<td>
											<p class="is-size-6">
												{#if prop === 'datetime'}
													<Time timestamp={value} format="HH:mm, MM/DD/YYYY" />
												{:else}
													{value}
												{/if}
											</p>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</Accordion>
		{/if}

		{#if viewparams.length > 0}
			<Accordion headerTitle="View geometry" bind:isExpanded={expanded['view:geometry']}>
				<div class="p-4" slot="content">
					<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
						<thead>
							<th>Parameter</th>
							<th>Value</th>
						</thead>
						<tbody>
							{#each viewgeometryProps as prop}
								{@const value = itemFeature.properties[prop]}
								{#if value}
									<tr>
										<td>{clean(prop.replace('view:', ''))}</td>
										<td>
											<p class="is-size-6">
												{value}
											</p>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</Accordion>
		{/if}

		<Accordion headerTitle="Preview map" bind:isExpanded={expanded['preview']}>
			<div class="p-4" slot="content">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select an asset</label>
					<div class="control">
						<div class="select is-link is-fullwidth">
							<select
								bind:value={selectedAssetName}
								on:change={handleSelectAsset}
								disabled={isLoading}
							>
								{#if Object.keys(itemFeature.assets).length > 1}
									<option value="">Select an asset</option>
								{/if}
								{#each Object.keys(itemFeature.assets) as assetName}
									{@const asset = itemFeature.assets[assetName]}
									{#if asset.type === 'image/tiff; application=geotiff; profile=cloud-optimized'}
										<option value={assetName}>{asset.title ? asset.title : assetName}</option>
									{/if}
								{/each}
							</select>
						</div>
					</div>
				</div>

				{#if metadata && !isRgbTile}
					{@const asset = itemFeature.assets[selectedAssetName]}
					{@const bands = getBandDescription(asset)}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a raster band</label>
						<div class="control">
							<RasterBandSelectbox
								bind:metadata
								bind:selectedBand
								bandsDetail={bands}
								on:change={handleBandSelected}
								disabled={isLoading}
							/>
						</div>
					</div>
				{/if}

				<div class="assets-explorer mt-1" style="height: {mapHeight}px;">
					<div bind:this={mapContainer} class="map"></div>
					{#if isLoading}
						<div class="loader-container"><Loader size="large" /></div>
					{/if}
				</div>
			</div>
		</Accordion>
	{/if}
{/await}

{#if itemFeature && selectedAssetName}
	<div class="popup" bind:this={popupContainer}>
		{#if popup}
			<button
				class="button is-primary is-normal {isLoading ? 'is-loading' : ''}"
				on:click={handleShowOnMap}
				disabled={isLoading}
			>
				Show it on map
			</button>
		{/if}
	</div>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.assets-explorer {
		position: relative;
		width: 100%;

		.map {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.loader-container {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 10;
		}
	}
</style>
