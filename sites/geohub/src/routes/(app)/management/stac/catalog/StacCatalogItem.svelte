<script lang="ts">
	import RasterBandSelectbox from '$components/pages/data/datasets/RasterBandSelectbox.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import { isRgbRaster } from '$lib/helper';
	import type {
		DatasetFeature,
		LayerCreationInfo,
		RasterTileMetadata,
		StacItemFeature
	} from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { Map, NavigationControl } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';

	export let stacId: string;
	export let url: string;
	export let height = 0;

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
		initialiseMap();
		return itemFeature;
	};

	const fetchItem = async (itemUrl: string) => {
		const res = await fetch(itemUrl);
		const json: StacItemFeature = await res.json();
		return json;
	};

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
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Item ID</label>
			<div class="control">
				<p class="is-size-6 mb-4">{itemFeature.id}</p>
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Platform</label>
			<div class="control">
				<p class="is-size-6 mb-4">{itemFeature.properties.platform}</p>
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Datetime</label>
			<div class="control">
				<p class="is-size-6 mb-4">
					<Time timestamp={itemFeature.properties.datatime} format="HH:mm, MM/DD/YYYY" />
				</p>
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Please select an asset</label>
			<div class="control">
				<div class="select is-link is-fullwidth">
					<select bind:value={selectedAssetName} on:change={handleSelectAsset} disabled={isLoading}>
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
	{/if}
{/await}

<div class="assets-explorer mt-1" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map"></div>
</div>

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
