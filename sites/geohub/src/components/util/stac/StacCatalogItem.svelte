<script lang="ts">
	import RasterBandSelectbox from '$components/pages/data/datasets/RasterBandSelectbox.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import { clean, isRgbRaster } from '$lib/helper';
	import type {
		DatasetFeature,
		LayerCreationInfo,
		RasterTileMetadata,
		StacItemFeature
	} from '$lib/types';
	import { Accordion, Loader } from '@undp-data/svelte-undp-design';
	import { Map, NavigationControl } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';

	export let stacId: string;
	export let url: string;
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
		});
	};

	const handleSelectAsset = async () => {
		rasterTile = undefined;
		metadata = undefined;
		isRgbTile = undefined;
		selectedBand = undefined;

		if (!selectedAssetName) return;

		isLoading = true;

		try {
			const apiUrl = `/api/stac/catalog/${stacId}/item?url=${url}&asset=${selectedAssetName}`;
			const res = await fetch(apiUrl);
			const feature: DatasetFeature = await res.json();

			rasterTile = new RasterTileData(feature);
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
								<option value="">Select an asset</option>
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
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a raster band</label>
						<div class="control">
							<RasterBandSelectbox
								bind:metadata
								bind:selectedBand
								on:change={handleBandSelected}
								disabled={isLoading}
							/>
						</div>
					</div>
				{/if}

				<div class="assets-explorer mt-1" style="height: {mapHeight}px;">
					<div bind:this={mapContainer} class="map"></div>
				</div>
			</div>
		</Accordion>
	{/if}
{/await}

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
	}
</style>
