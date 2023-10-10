<script lang="ts">
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { MosaicJsonData } from '$lib/MosaicJsonData';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles, StacMinimumZoom, StacSearchLimitOptions } from '$lib/config/AppConfig';
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
		type RasterLayerSpecification,
		type RasterSourceSpecification
	} from 'maplibre-gl';
	import { onMount, createEventDispatcher } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import Notification from '$components/controls/Notification.svelte';
	import ShowDetails from '$components/data-upload/ShowDetails.svelte';
	import { debounce } from 'lodash-es';
	import { page } from '$app/stores';

	const dispatch = createEventDispatcher();

	const STAC_SEARCH_LIMIT = 100;
	const MIN_CLOUD_COVER = 5;

	export let stacId: string;
	export let collection: string;
	export let center = [0, 0];
	export let zoom = 0;

	let stacInstance: StacTemplate;
	let searchLimit = STAC_SEARCH_LIMIT;
	let cloudCoverRate = [MIN_CLOUD_COVER];
	let isMosaic = false;

	let isLoading = false;
	$: isLoading, setMapInteractive();

	let stacItemFeatureCollection: StacItemFeatureCollection;
	let selectedAsset: string;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let currentZoom = zoom;
	let showZoomNotification = false;
	let showDetails = false;

	let clickedFeatures: MapGeoJSONFeature[] = [];

	let stacAssetFeature: DatasetFeature;
	let metadata: RasterTileMetadata;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;

	onMount(() => {
		stacInstance = getStacInstance(stacId, collection);
		if (!stacInstance) return;

		initialiseMap();
		initialise();
	});

	const initialise = async () => {
		const feature = await stacInstance.getFirstAsset();
		const assets = feature.assets;
		if (Object.keys(assets).length > 0) {
			const asset = Object.keys(assets).filter(
				(key) => assets[key].type === 'image/tiff; application=geotiff; profile=cloud-optimized'
			);
			if (asset.length > 0) {
				selectedAsset = asset[0];
			}
		}

		await stacInstance.getStacCollection();
	};

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [center[0], center[1]],
			zoom: currentZoom
		});

		map.addControl(new NavigationControl(), 'bottom-left');
		map.addControl(
			new GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true
				},
				trackUserLocation: true
			}),
			'bottom-left'
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

		map.on('moveend', handleMapMoved);
		map.on('zoomend', handleMapMoved);

		map.on('click', async (e: MapMouseEvent) => {
			if (!map?.getLayer('stac-fill')) return;

			const { x, y } = e.point;
			const features = map.queryRenderedFeatures([x, y], { layers: ['stac-fill'] });
			stacAssetFeature = undefined;

			if (features.length === 0) {
				return;
			}

			const feature = features[0];

			const index = clickedFeatures.findIndex((f) => f.properties.id === feature.properties.id);
			if (index > -1) {
				map.setFeatureState(feature, { click: false });
				clickedFeatures.splice(index, 1);
			} else {
				map.setFeatureState(feature, { click: true });
				clickedFeatures = [...clickedFeatures, feature];
			}

			if (clickedFeatures.length === 0) return;

			isLoading = true;
			try {
				const itemIds = clickedFeatures.map((f) => f.properties.id);
				metadata = undefined;
				stacAssetFeature = await getDatasetFeature(itemIds);
			} finally {
				isLoading = false;
			}
		});
	};

	const setMapInteractive = () => {
		if (!map) return;
		if (isLoading) {
			map.boxZoom.disable();
			map.doubleClickZoom.disable();
			map.dragPan.disable();
			map.dragRotate.disable();
			map.scrollZoom.disable();
			map.touchPitch.disable();
			map.touchZoomRotate.disable();
		} else {
			map.boxZoom.enable();
			map.doubleClickZoom.enable();
			map.dragPan.enable();
			map.dragRotate.enable();
			map.scrollZoom.enable();
			map.touchPitch.enable();
			map.touchZoomRotate.enable();
		}
	};

	const handleMapMoved = debounce(async () => {
		currentZoom = map.getZoom();
		if (currentZoom > StacMinimumZoom) {
			isLoading = true;
			try {
				await searchStacItems();
			} finally {
				isLoading = false;
			}
		}
	}, 300);

	$: cloudCoverRate, handleCloudRateChanged();

	const handleCloudRateChanged = debounce(async () => {
		if (currentZoom <= StacMinimumZoom) return;

		try {
			stacItemFeatureCollection = undefined;
			await searchStacItems();
		} finally {
			isLoading = false;
		}
	}, 300);

	const searchStacItems = async () => {
		if (!map) return;

		const bbox = map.getBounds();

		const fc = await stacInstance.search(bbox, searchLimit, cloudCoverRate[0]);

		if (fc.features.length > 0) {
			const assets = fc.features[0].assets;

			if (Object.keys(assets).length > 0) {
				const asset = Object.keys(assets).filter(
					(key) => assets[key].type === 'image/tiff; application=geotiff; profile=cloud-optimized'
				);
				if (asset.length > 0) {
					selectedAsset = asset[0];
				}
			}
		}

		for (const feature of fc.features) {
			feature.properties['id'] = feature.id;
		}

		if (!stacItemFeatureCollection) {
			stacItemFeatureCollection = fc;
		} else {
			fc.features.forEach((f) => {
				if (stacItemFeatureCollection.features.find((x) => x.properties.id === f.properties.id))
					return;
				stacItemFeatureCollection.features.push(f);
			});
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
		for (const feature of clickedFeatures) {
			map.setFeatureState(feature, { click: true });
		}
	};

	const handleSelectedAssets = async () => {
		if (clickedFeatures.length === 0) return;
		if (!collection) return;
		if (!selectedAsset) {
			clickedFeatures = [];
			return;
		}
		isLoading = true;
		try {
			const ids = clickedFeatures.map((f) => f.properties.id);
			stacAssetFeature = undefined;
			metadata = undefined;
			stacAssetFeature = await getDatasetFeature(ids);
		} finally {
			isLoading = false;
		}
	};

	const getDatasetFeature = async (itemIds: string[]) => {
		const url = `/api/stac/${stacId}/${collection}/${itemIds.join('/')}/${selectedAsset}`;
		const res = await fetch(url);
		if (!res.ok) {
			stacAssetFeature = undefined;
		} else {
			stacAssetFeature = await res.json();
		}
		return stacAssetFeature;
	};

	const handleShowOnMap = async () => {
		isLoading = true;
		try {
			const type = stacAssetFeature.properties.tags.find((t) => t.key === 'stacType')?.value;
			if (type === 'mosaicjson' && clickedFeatures.length > 1 && isMosaic === false) {
				// mosaicjson, but user selected add data as scenes
				// fetch feature by scenes from server
				const asset = stacAssetFeature.properties.tags.find((t) => t.key === 'asset');
				const itemIds = stacAssetFeature.properties.tags.filter((t) => t.key === 'item');
				const dataArray = [];
				for (const item of itemIds) {
					const url = `${$page.url.origin}/api/stac/${stacId}/${collection}/${item.value}/${asset.value}`;
					const res = await fetch(url);
					const feature: DatasetFeature = await res.json();
					const data = await createMaplibreLayer(feature);
					dataArray.push(data);
				}
				dispatch('dataAdded', {
					layers: dataArray
				});
				return;
			} else {
				const data = await createMaplibreLayer(stacAssetFeature);
				dispatch('dataAdded', {
					layers: [data]
				});
			}
		} finally {
			isLoading = false;
		}
	};

	const createMaplibreLayer = async (feature: DatasetFeature) => {
		const stacType = feature.properties.tags.find((t) => t.key === 'stacType')?.value;
		let data: {
			geohubLayer?: Layer;
			layer?: RasterLayerSpecification;
			source?: RasterSourceSpecification;
			sourceId?: string;
			metadata?: RasterTileMetadata;
			colormap?: string;
		} = {};
		if (stacType === 'mosaicjson') {
			const mosaicTile = new MosaicJsonData(feature);
			data = await mosaicTile.add(undefined, defaultColormap);
		} else {
			const rasterTile = new RasterTileData(feature);
			data = await rasterTile.add(undefined, defaultColormap);
		}
		data.geohubLayer = {
			id: data.layer.id,
			name: feature.properties.name,
			info: data.metadata,
			dataset: feature,
			colorMapName: data.colormap
		};
		return data;
	};
</script>

<div class="assets-explorer mt-1">
	<div bind:this={mapContainer} class="map">
		<div class="controler">
			<p
				class="is-size-7 has-text-weight-bold {currentZoom <= StacMinimumZoom
					? 'has-text-danger'
					: 'has-text-success'}"
			>
				Zoom: {currentZoom === 0 ? 0 : currentZoom.toFixed(1)}
				{#if currentZoom <= StacMinimumZoom}
					(Zoom more)
				{/if}
			</p>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-size-7">Search limit</label>
			<div class="control">
				<div class="select is-small">
					<select bind:value={searchLimit} disabled={isLoading}>
						{#each StacSearchLimitOptions as limit}
							<option value={limit}>{limit}</option>
						{/each}
					</select>
				</div>
			</div>

			{#if stacInstance?.hasCloudCoverProp}
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label is-size-7 mt-2">Max Cloud cover: {cloudCoverRate[0]}%</label>
				<div class=" range-slider">
					<RangeSlider
						bind:values={cloudCoverRate}
						disabled={isLoading}
						float
						min={0}
						max={100}
						step={1}
						pips
						first="label"
						last="label"
						rest={false}
						suffix="%"
					/>
				</div>
			{/if}
		</div>
		{#if showZoomNotification && currentZoom <= StacMinimumZoom}
			<div class="notification has-text-weight-bold has-text-danger subtitle is-5">
				Please zoom to your target area. Minimum zoom level is {StacMinimumZoom}.
			</div>
		{/if}
		{#if isLoading}
			<div class="map-loader is-flex is-justify-content-center is-align-items-center">
				<Loader />
			</div>
		{/if}

		{#if stacItemFeatureCollection}
			<div class="search-result p-2">
				{#if stacItemFeatureCollection?.features?.length > 0}
					{@const feature = stacItemFeatureCollection.features[0]}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select an asset</label>
						<div class="control">
							<div class="select is-link is-fullwidth">
								<select
									bind:value={selectedAsset}
									on:change={handleSelectedAssets}
									disabled={isLoading}
								>
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

				{#if clickedFeatures.length > 0}
					<Notification type="info" showCloseButton={false}>
						{clickedFeatures.length} item{clickedFeatures.length > 1 ? 's' : ''} selected.
					</Notification>
					<ShowDetails bind:show={showDetails} />
					{#if showDetails}
						<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
							<thead>
								<tr>
									<th>No.</th>
									<th>Datetime</th>
									{#if stacInstance.hasCloudCoverProp}
										<th>Cloud cover (%)</th>
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each clickedFeatures as feature, index}
									<tr>
										<th>{index + 1}</th>
										<th
											><Time
												timestamp={feature.properties.datetime}
												format="HH:mm, MM/DD/YYYY"
											/></th
										>
										{#if stacInstance.hasCloudCoverProp}
											<th>{feature.properties[stacInstance.cloudCoverPropName].toFixed(2)}%</th>
										{/if}
									</tr>
								{/each}
							</tbody>
						</table>
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
								{#if clickedFeatures.length > 1}
									<!-- svelte-ignore a11y-label-has-associated-control -->
									<label class="label">Selected items are added by: </label>
									<div class="control">
										<div class="buttons has-addons">
											<button
												class="button {!isMosaic ? 'is-primary' : 'is-primary is-light'}"
												disabled={isLoading}
												on:click={() => (isMosaic = false)}>Scene</button
											>
											<button
												class="button {isMosaic ? 'is-primary' : 'is-primary is-light'}"
												disabled={isLoading}
												on:click={() => (isMosaic = true)}>Merge scenes</button
											>
										</div>
									</div>
									{#if isMosaic}
										<p class="help is-info">
											If scenes are merged as a mosaic, some functionalities might be limited in
											GeoHub.
										</p>
									{/if}
								{/if}

								<button
									class="mt-2 button is-primary is-fullwidth {isLoading ? 'is-loading' : ''}"
									on:click={handleShowOnMap}
									disabled={isLoading}
									><p class="has-text-weight-semibold">Show it on map</p></button
								>
							</div>
						{/key}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.assets-explorer {
		position: relative;
		width: 100%;
		height: 60vh;

		.map {
			position: relative;
			width: 100%;
			height: 100%;

			.controler {
				position: absolute;
				top: 5px;
				left: 5px;
				z-index: 10;
				background-color: rgba(255, 255, 255, 0.8);
				width: 250px;
				padding: 0.3rem;

				.range-slider {
					--range-handle-focus: #2196f3;
					--range-range-inactive: #2196f3;
					--range-handle-inactive: #2196f3;
					--range-handle: #2196f3;
				}
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
				z-index: 10;
				background-color: rgba(255, 255, 255, 0.5);
			}

			.map-loader {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translateX(-50%) translateY(-50%);
				-webkit-transform: translateX(-50%) translateY(-50%);
				-ms-transform: translateX(-50%) translateY(-50%);
				z-index: 10;
			}

			.search-result {
				position: absolute;
				top: 10px;
				right: 10px;
				width: 300px;
				background-color: rgba(255, 255, 255, 1);
				z-index: 10;
			}
		}
	}
</style>
