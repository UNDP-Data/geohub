<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles, StacMinimumZoom } from '$lib/config/AppConfig';
	import { fromLocalStorage, storageKeys, toLocalStorage } from '$lib/helper';
	import type { StacTemplate } from '$lib/stac/StacTemplate';
	import { getStacInstance } from '$lib/stac/getStacInstance';
	import type {
		DatasetFeature,
		Layer,
		RasterTileMetadata,
		StacItemFeatureCollection
	} from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import {
		GeolocateControl,
		Map,
		MapMouseEvent,
		NavigationControl,
		type MapGeoJSONFeature,
		type StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';

	const STAC_SEARCH_LIMIT = 10;
	const MIN_CLOUD_COVER = 5;

	export let stacType: string;
	export let collection: string;

	let stacInstance: StacTemplate;

	let isInitialising: Promise<void>;
	let isSearchingItem = false;

	let stacItemFeatureCollection: StacItemFeatureCollection;
	let selectedAsset: string;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let currentZoom = 0;
	let showZoomNotification = false;
	let hoveredFeatures: MapGeoJSONFeature[] = [];
	let clickedFeature: MapGeoJSONFeature;

	let stacAssetFeature: DatasetFeature;
	let metadata: RasterTileMetadata;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;

	onMount(() => {
		stacInstance = getStacInstance(stacType, collection);
		if (!stacInstance) return;

		initialiseMap();
		isInitialising = initialise();
	});

	const initialise = async () => {
		await stacInstance.getFirstAsset();
	};

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: currentZoom
		});

		map.addControl(new NavigationControl(), 'bottom-right');
		map.addControl(
			new GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true
				},
				trackUserLocation: true
			}),
			'bottom-right'
		);
		currentZoom = map.getZoom();

		map.once('load', () => {
			if (currentZoom <= StacMinimumZoom) {
				showZoomNotification = true;
				setTimeout(() => {
					showZoomNotification = false;
				}, 2000);
			}
		});

		map.on('zoomend', () => {
			currentZoom = map.getZoom();
			if (currentZoom > StacMinimumZoom) {
				isSearchingItem = true;
				map._interactive = false;
				searchStacItems().then(() => {
					isSearchingItem = false;
					map._interactive = true;
				});
			}
		});

		map.on('mousemove', (e: MapMouseEvent) => {
			if (!map?.getLayer('stac-fill')) return;
			for (const feature of hoveredFeatures) {
				map.setFeatureState(feature, { hover: false });
			}
			hoveredFeatures = [];

			const { x, y } = e.point;
			const features = map.queryRenderedFeatures([x, y], { layers: ['stac-fill'] });

			for (const feature of features) {
				map.setFeatureState(feature, { hover: true });
				hoveredFeatures.push(feature);
			}
		});

		map.on('click', async (e: MapMouseEvent) => {
			if (!map?.getLayer('stac-fill')) return;

			const { x, y } = e.point;
			const features = map.queryRenderedFeatures([x, y], { layers: ['stac-fill'] });
			stacAssetFeature = undefined;
			clickedFeature = undefined;
			if (features.length > 0) {
				const feature = features[0];

				const itemId = feature.properties.id;
				const res = await fetch(`/api/stac/${stacType}/${collection}/${itemId}/${selectedAsset}`);
				stacAssetFeature = await res.json();
				clickedFeature = feature;
			}
		});
	};

	const searchStacItems = async () => {
		if (!map) return;

		const bbox = map.getBounds();

		stacItemFeatureCollection = await stacInstance.search(bbox, STAC_SEARCH_LIMIT, MIN_CLOUD_COVER);

		if (stacItemFeatureCollection.features.length > 0) {
			const assets = stacItemFeatureCollection.features[0].assets;
			if (Object.keys(assets).length > 0) {
				selectedAsset = Object.keys(assets)[0];
			}
		}

		for (const feature of stacItemFeatureCollection.features) {
			feature.properties['id'] = feature.id;
		}

		const layerId = 'stac';
		if (map.getSource(layerId)) {
			map.removeLayer(`${layerId}-fill`);
			map.removeLayer(`${layerId}-line`);
			map.removeSource(layerId);
		}
		map.addSource(layerId, {
			type: 'geojson',
			data: stacItemFeatureCollection,
			promoteId: 'id'
		});
		map.addLayer({
			id: `${layerId}-fill`,
			type: 'fill',
			source: layerId,
			paint: {
				'fill-color': 'rgb(0,110,181)',
				'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.3, 0.3 - 0.15],
				'fill-outline-color': 'rgba(0,110,181, 1)'
			}
		});
		map.addLayer({
			id: `${layerId}-line`,
			type: 'line',
			source: layerId,
			paint: {
				'line-color': 'rgba(0,110,181, 1)',
				'line-width': 2
			}
		});
	};

	const handleSelectedAssets = async () => {
		if (!clickedFeature) return;
		if (!collection) return;
		if (!selectedAsset) {
			clickedFeature = undefined;
			return;
		}
		stacAssetFeature = undefined;
		const itemId = clickedFeature.properties.id;
		const url = `/api/stac/${stacType}/${collection}/${itemId}/${selectedAsset}`;
		const res = await fetch(url);
		stacAssetFeature = await res.json();
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

		const rasterTile = new RasterTileData(stacAssetFeature, metadata, 1);
		const data = await rasterTile.add(undefined, defaultColormap);
		storageLayerList = [
			{
				id: data.layer.id,
				name: stacAssetFeature.properties.name,
				info: data.metadata,
				dataset: stacAssetFeature,
				colorMapName: data.colormap
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
		// save layer info to localstorage
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}`;
		goto(url, { invalidateAll: true });
	};
</script>

<p class="title is-5">STAC data explorer</p>

<div class="assets-explorer columns mt-1">
	<div class="column is-8">
		<div bind:this={mapContainer} class="map">
			<div
				class="zoom-level has-text-weight-bold {currentZoom <= StacMinimumZoom
					? 'has-text-danger'
					: 'has-text-success'}"
			>
				Zoom: {currentZoom === 0 ? 0 : currentZoom.toFixed(1)}
			</div>
			{#if showZoomNotification && currentZoom <= StacMinimumZoom}
				<div class="notification has-text-weight-bold has-text-danger subtitle is-5">
					Please zoom to your target area. Minimum zoom level is {StacMinimumZoom}.
				</div>
			{/if}
			{#if isSearchingItem}
				<div class="map-loader is-flex is-justify-content-center is-align-items-center">
					<Loader />
				</div>
			{/if}
		</div>
	</div>
	<div class="column is-4">
		{#await isInitialising}
			<div class="is-flex is-justify-content-center is-align-items-center">
				<Loader />
			</div>
		{:then}
			{#if currentZoom > StacMinimumZoom}
				{#if clickedFeature}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Datetime</label>
						<div class="control">
							<Time timestamp={clickedFeature.properties.datetime} format="HH:mm, MM/DD/YYYY" />
						</div>
					</div>
					{#if clickedFeature.properties['eo:cloud_cover']}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Cloud cover</label>
							<div class="control">
								{clickedFeature.properties['eo:cloud_cover'].toFixed(2)}%
							</div>
						</div>
					{/if}

					{#if stacItemFeatureCollection?.features?.length > 0}
						{@const feature = stacItemFeatureCollection.features[0]}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Please select an asset</label>
							<div class="control">
								<div class="select is-link is-fullwidth">
									<select bind:value={selectedAsset} on:change={handleSelectedAssets}>
										{#each Object.keys(feature.assets) as assetName}
											{@const asset = feature.assets[assetName]}
											{#if asset.type === 'image/tiff; application=geotiff; profile=cloud-optimized'}
												<option value={assetName}>{asset.title ? asset.title : assetName}</option>
											{/if}
										{/each}
									</select>
								</div>
							</div>
						</div>
					{/if}
					{#if stacAssetFeature}
						{#key selectedAsset}
							<MiniMap
								bind:feature={stacAssetFeature}
								isLoadMap={true}
								width="100%"
								height="200px"
								bind:metadata
								bind:defaultColor
								bind:defaultColormap
							/>
							<div class="mt-2">
								<button class="button is-primary is-medium" on:click={handleShowOnMap}
									><p class="has-text-weight-semibold">Show it on map</p></button
								>
							</div>
						{/key}
					{/if}
				{/if}
			{:else}
				<Notification type="info" showCloseButton={false}>
					Please zoom to more than zoom level {StacMinimumZoom}, then select a stac item on the map.
				</Notification>
			{/if}
		{/await}
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.assets-explorer {
		min-height: 500px;
		max-height: 60vh;

		.map {
			position: relative;
			width: 100%;
			height: 100%;

			.zoom-level {
				position: absolute;
				top: 5px;
				left: 5px;
				z-index: 99;
				background-color: rgba(255, 255, 255, 0.5);
				width: fit-content;
				padding: 0.3rem;
			}

			.notification {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translateX(-50%) translateY(-50%);
				-webkit-transform: translateX(-50%) translateY(-50%);
				-ms-transform: translateX(-50%) translateY(-50%);
				width: fit-content;
				height: fit-content;
				z-index: 99;
				background-color: rgba(255, 255, 255, 0.5);
			}

			.map-loader {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translateX(-50%) translateY(-50%);
				-webkit-transform: translateX(-50%) translateY(-50%);
				-ms-transform: translateX(-50%) translateY(-50%);
				z-index: 99;
			}
		}
	}
</style>
