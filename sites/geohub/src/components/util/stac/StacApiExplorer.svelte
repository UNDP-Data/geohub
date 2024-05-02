<script lang="ts">
	import { page } from '$app/stores';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import {
		MapStyles,
		StacDateFilterOptions,
		StacMinimumZoom,
		StacSearchLimitOptions
	} from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { StacTemplate } from '$lib/stac/StacTemplate';
	import { getStacInstance } from '$lib/stac/getStacInstance';
	import type {
		DatasetFeature,
		Layer,
		LayerCreationInfo,
		RasterTileMetadata,
		Stac,
		StacItemFeatureCollection
	} from '$lib/types';
	import {
		DatePicker,
		FieldControl,
		Notification,
		SegmentButtons,
		ShowDetails,
		Slider
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import dayjs from 'dayjs';
	import { debounce } from 'lodash-es';
	import {
		GeolocateControl,
		Map,
		NavigationControl,
		type LngLatBoundsLike,
		type MapGeoJSONFeature,
		type MapMouseEvent
	} from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import Time from 'svelte-time';

	const dispatch = createEventDispatcher();

	const NOTIFICATION_MESSAGE_TIME = 5000;
	const MAX_ZOOOM = 8;

	let config: UserConfig = $page.data.config;

	export let stacId: string;
	export let collection: string;
	export let center = [0, 0];
	export let zoom = 0;
	export let height = 0;

	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;

	let stacInstance: StacTemplate;
	let searchLimit = config.StacSearchLimit;
	let cloudCoverRate = [config.StacMaxCloudCover];
	let sceneType: string = 'scene';

	let isInitialising: Promise<void>;
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

	let temporalIntervalFrom: Date;
	let temporalIntervalTo: Date;

	let searchDateFrom: Date;
	let searchDateTo: Date;
	let selectedDateFilterOption = config.StacDateFilterOption;

	let layerCreationInfo: LayerCreationInfo;

	onMount(async () => {
		const res = await fetch(`/api/stac/${stacId}`);
		const stac: Stac = await res.json();
		stacInstance = getStacInstance(stac, collection);
		if (!stacInstance) return;

		initialiseMap();
		isInitialising = initialise();
	});

	$: mapHeight, mapResize();
	const mapResize = () => {
		if (!map) return;
		map.redraw();
		map.resize();
	};

	let assetList: string[] = [];

	const initialise = async () => {
		const feature = await stacInstance.getFirstAsset();
		const assets = feature.assets;
		if (Object.keys(assets).length > 0) {
			assetList = Object.keys(assets).filter(
				// it is preferred to use `image/tiff; application=geotiff; profile=cloud-optimized` to check asset type,
				// but we found some of COG from some STAC server, they don't put `profile=cloud-optimized`.
				// So I removed profile from validation.
				(key) => assets[key].type.indexOf('image/tiff; application=geotiff') !== -1
			);
			if (assetList.length === 1) {
				selectedAsset = assetList[0];
			} else if (assetList.length > 1) {
				selectedAsset = '';
			}
		}

		await stacInstance.getStacCollection();
		const extent = stacInstance.getMaxExtent();
		const lng = center[0];
		const lat = center[1];
		if (!(lng > extent[0] && lng < extent[2] && lat > extent[1] && lat < extent[3])) {
			const bounds: LngLatBoundsLike = [
				[extent[0], extent[1]],
				[extent[2], extent[3]]
			];
			map.setMaxBounds(bounds);
			map.fitBounds(bounds);
		}

		temporalIntervalFrom = dayjs(stacInstance.intervalFrom).toDate();
		temporalIntervalTo = stacInstance.intervalTo
			? dayjs(stacInstance.intervalTo).toDate()
			: new Date();

		handleDateFilterOptionChanged();
	};

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [center[0], center[1]],
			zoom: currentZoom,
			maxZoom: MAX_ZOOOM
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
				}, NOTIFICATION_MESSAGE_TIME);
			}
			mapResize();
		});

		map.on('moveend', handleMapExtentChanged);
		map.on('zoomend', handleMapExtentChanged);

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
			if (!selectedAsset) return;
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

	const handleDateFilterOptionChanged = () => {
		if (!selectedDateFilterOption) return;
		if (selectedDateFilterOption === -1) {
			// all data
			searchDateFrom = temporalIntervalFrom;
			searchDateTo = temporalIntervalTo;
		} else if (selectedDateFilterOption > 0) {
			// set dateTo automatically by reducing number of months in selected value
			searchDateFrom = dayjs(temporalIntervalTo)
				.add(selectedDateFilterOption * -1, 'month')
				.toDate();
			searchDateTo = temporalIntervalTo;
		}
	};

	$: searchLimit, handleMapExtentChanged();
	$: cloudCoverRate, handleSearchParameterChanged();
	$: searchDateFrom, handleSearchParameterChanged();
	$: searchDateTo, handleSearchParameterChanged();

	const handleMapExtentChanged = debounce(async () => {
		if (!map) return;
		currentZoom = map.getZoom();
		if (currentZoom <= StacMinimumZoom) return;

		try {
			await searchStacItems();
		} finally {
			isLoading = false;
		}
	}, 300);

	const handleSearchParameterChanged = debounce(async () => {
		if (currentZoom <= StacMinimumZoom) return;

		try {
			stacItemFeatureCollection = undefined;
			clickedFeatures = [];
			await searchStacItems();
		} finally {
			isLoading = false;
		}
	}, 300);

	const searchStacItems = async () => {
		if (!map) return;

		const bbox = map.getBounds();

		const fc = await stacInstance.search(
			bbox,
			searchLimit,
			cloudCoverRate[0],
			searchDateFrom?.toISOString(),
			searchDateTo?.toISOString()
		);

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
		if (!selectedAsset) return;
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
			if (type === 'mosaicjson' && clickedFeatures.length > 1 && sceneType === 'scene') {
				// mosaicjson, but user selected add data as scenes
				// fetch feature by scenes from server
				const asset = stacAssetFeature.properties.tags.find((t) => t.key === 'asset');
				const itemIds = stacAssetFeature.properties.tags.filter((t) => t.key === 'item');
				const dataArray = [];
				for (const item of itemIds) {
					const url = `${$page.url.origin}/api/stac/${stacId}/${collection}/${item.value}/${asset.value}`;
					const res = await fetch(url);
					const feature: DatasetFeature = await res.json();

					const rasterTile = new RasterTileData(feature);
					const data: LayerCreationInfo & { geohubLayer?: Layer } = await rasterTile.add(
						undefined,
						undefined,
						layerCreationInfo.colormap_name
					);

					data.geohubLayer = {
						id: data.layer.id,
						name: feature.properties.name,
						info: data.metadata,
						dataset: feature,
						colorMapName: data.colormap_name
					};

					dataArray.push(data);
				}
				dispatch('dataAdded', {
					layers: dataArray
				});
				return;
			} else {
				const data: LayerCreationInfo & { geohubLayer?: Layer } = layerCreationInfo;

				data.geohubLayer = {
					id: data.layer.id,
					name: stacAssetFeature.properties.name,
					info: data.metadata,
					dataset: stacAssetFeature,
					colorMapName: data.colormap_name
				};
				dispatch('dataAdded', {
					layers: [data]
				});
			}
		} finally {
			isLoading = false;
		}
	};

	const handleLayerAdded = (e: { detail: LayerCreationInfo }) => {
		layerCreationInfo = e.detail;
	};
</script>

<svelte:window bind:innerHeight />

<div class="assets-explorer mt-1" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map">
		{#await isInitialising then}
			<div class="controler">
				<p
					class="is-size-6 has-text-weight-bold {currentZoom <= StacMinimumZoom
						? 'has-text-danger'
						: 'has-text-success'} mb-2"
				>
					Zoom: {currentZoom === 0 ? 0 : currentZoom.toFixed(1)}
					{#if currentZoom <= StacMinimumZoom}
						(Zoom more)
					{/if}
				</p>

				<FieldControl title="Search limit" showHelp={false} fontWeight="bold">
					<div slot="control">
						<div class="select is-small is-fullwidth">
							<select bind:value={searchLimit} disabled={isLoading}>
								{#each StacSearchLimitOptions as limit}
									<option value={limit}>{limit}</option>
								{/each}
							</select>
						</div>
					</div>
				</FieldControl>

				{#if temporalIntervalFrom && temporalIntervalTo && temporalIntervalFrom.toString() !== temporalIntervalTo.toString()}
					<div class="is-flex">
						<FieldControl title="Search from" showHelp={false} fontWeight="bold">
							<div class="mr-1" slot="control">
								<DatePicker
									bind:value={searchDateFrom}
									bind:min={temporalIntervalFrom}
									bind:max={temporalIntervalTo}
									format="MM/DD/YYYY"
									size="small"
									width={85}
								/>
							</div>
						</FieldControl>
						<FieldControl title="Search to" showHelp={false} fontWeight="bold">
							<div slot="control">
								<DatePicker
									bind:value={searchDateTo}
									bind:min={temporalIntervalFrom}
									bind:max={temporalIntervalTo}
									format="MM/DD/YYYY"
									size="small"
									width={85}
								/>
							</div>
						</FieldControl>
					</div>

					<div class="select is-fullwidth">
						<select bind:value={selectedDateFilterOption} on:change={handleDateFilterOptionChanged}>
							{#each StacDateFilterOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if stacInstance?.hasCloudCoverProp}
					<div class="mt-2">
						<FieldControl
							title="Max Cloud cover: {cloudCoverRate[0]}%"
							showHelp={false}
							fontWeight="bold"
						>
							<div slot="control">
								<Slider
									bind:values={cloudCoverRate}
									disabled={isLoading}
									min={0}
									max={100}
									step={1}
									pips
									first="label"
									last="label"
									rest={false}
									suffix="%"
									range="min"
								/>
							</div>
						</FieldControl>
					</div>
				{/if}
			</div>
		{/await}
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

					<FieldControl title="Please select an asset" showHelp={false}>
						<div slot="control">
							<div class="select is-link is-fullwidth">
								<select
									bind:value={selectedAsset}
									on:change={handleSelectedAssets}
									disabled={isLoading}
								>
									{#if assetList.length > 1}
										<option value="">Select an asset</option>
									{/if}
									{#each assetList as assetName}
										{@const asset = feature.assets[assetName]}
										<option value={assetName}>{asset.title ? asset.title : assetName}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
				{/if}

				{#if clickedFeatures.length > 0}
					<Notification type="info" showCloseButton={false}>
						{clickedFeatures.length} item{clickedFeatures.length > 1 ? 's' : ''} selected.
					</Notification>
					<div class="my-2">
						<ShowDetails bind:show={showDetails} />
					</div>
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

					{#if stacAssetFeature && selectedAsset}
						{#key selectedAsset}
							<MiniMap
								bind:feature={stacAssetFeature}
								isLoadMap={true}
								width="100%"
								height="200px"
								bind:metadata
								on:layerAdded={handleLayerAdded}
							/>
							<div class="mt-2">
								{#if clickedFeatures.length > 1}
									<!-- svelte-ignore a11y-label-has-associated-control -->
									<label class="label">Selected items are added by: </label>
									<div class="control">
										<SegmentButtons
											buttons={[
												{ title: 'Scene', value: 'scene', disabled: isLoading },
												{ title: 'Merge scenes', value: 'mosaic', disabled: isLoading }
											]}
											bind:selected={sceneType}
										/>
									</div>
									{#if sceneType === 'mosaic'}
										<p class="help is-info">
											If scenes are merged as a mosaic, some functionalities might be limited in
											GeoHub.
										</p>
									{/if}
								{/if}

								{#if layerCreationInfo}
									<button
										class="mt-2 button is-primary is-fullwidth has-text-weight-bold is-uppercase {isLoading
											? 'is-loading'
											: ''}"
										on:click={handleShowOnMap}
										disabled={isLoading}
										><p class="has-text-weight-semibold">Show it on map</p></button
									>
								{/if}
							</div>
						{/key}
					{:else}
						<Notification type="info" showCloseButton={false}>
							You have selected {clickedFeatures.length} feature{clickedFeatures.length > 1
								? 's'
								: ''} on the map. To do preview it, please select an asset from the above select box.
						</Notification>
					{/if}
				{:else}
					<Notification type="info" showCloseButton={false}>
						Please select a feature on the map.
					</Notification>
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

		:global() {
			--date-input-width: 115px;
		}

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
