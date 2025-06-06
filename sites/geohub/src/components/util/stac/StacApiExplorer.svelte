<script lang="ts">
	import { page } from '$app/state';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import {
		MapStyles,
		StacDateFilterOptions,
		StacMinimumZoom,
		StacSearchLimitOptions
	} from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { generateHashKey } from '$lib/helper';
	import type { StacTemplate } from '$lib/stac/StacTemplate';
	import { getStacInstance } from '$lib/stac/getStacInstance';
	import type {
		DatasetFeature,
		Layer,
		LayerCreationInfo,
		Stac,
		StacDataLayer,
		StacItemFeatureCollection,
		StacProduct,
		Tag
	} from '$lib/types';
	import {
		clean,
		DatePicker,
		FieldControl,
		initTooltipTippy,
		Notification,
		type RasterAlgorithm,
		type RasterTileMetadata,
		SegmentButtons,
		ShowDetails,
		Slider,
		Tabs
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import dayjs from 'dayjs';
	import { debounce } from 'lodash-es';
	import {
		GeolocateControl,
		type LngLatBoundsLike,
		Map,
		type MapGeoJSONFeature,
		type MapMouseEvent,
		NavigationControl
	} from 'maplibre-gl';
	import { onMount, untrack } from 'svelte';
	import Time from 'svelte-time';

	const NOTIFICATION_MESSAGE_TIME = 5000;
	const MAX_ZOOM = 8;

	const tooltipTippy = initTooltipTippy();

	let config: UserConfig = page.data.config;

	interface Props {
		stacId: string;
		collection: string;
		center?: number[];
		zoom?: number;
		height?: number;
		selectedTool?: RasterAlgorithm | string;
		dataset: DatasetFeature;
		onDataAdded?: (layers: StacDataLayer[]) => void;
	}

	let {
		stacId,
		collection,
		center = [0, 0],
		zoom = 0,
		height = 0,
		selectedTool = '',
		dataset,
		onDataAdded = () => {}
	}: Props = $props();

	let innerHeight: number = $state(0);

	let stacInstance: StacTemplate = $state();
	let searchLimit = $state(config.StacSearchLimit);
	let cloudCoverRate = $state([config.StacMaxCloudCover]);
	let sceneType: string = $state('scene');
	let AvailableProducts: StacProduct[] = $state();
	let Product: StacProduct;
	let isInitialising: Promise<void> = $state();
	let isLoading = $state(false);
	let stacItemFeatureCollection: StacItemFeatureCollection = $state();
	let selectedAsset: string = $state();
	let selectedProduct: string = $state();
	let selectedAlgorithmName: string = $state();
	let mapContainer: HTMLDivElement = $state();
	let map: Map;
	let currentZoom = $state(zoom);
	let showZoomNotification = $state(false);
	let showDetails = $state(false);
	let registeredTools: Tag[] = $state([]);
	let clickedFeatures: MapGeoJSONFeature[] = $state([]);
	let stacDatasetFeature: DatasetFeature | undefined = $state();
	let metadata: RasterTileMetadata = $state();
	let selectedToolAssets: { [key: number]: string } = $state({});
	let temporalIntervalFrom: Date = $state();
	let temporalIntervalTo: Date = $state();
	let searchDateFrom: Date = $state();
	let searchDateTo: Date = $state();
	let selectedDateFilterOption = $state(config.StacDateFilterOption);
	let assetSelectionDone: boolean = $state(false);
	let layerCreationInfo: LayerCreationInfo = $state();
	let toolSelectionComplete: boolean = $state(false);

	onMount(async () => {
		const res = await fetch(`/api/stac/${stacId}`);
		const stac: Stac = await res.json();
		stacInstance = getStacInstance(stac, collection);
		if (!stacInstance) return;
		const productsRes = await fetch(`/api/stac/${stacId}/${collection}/products`);
		AvailableProducts = await productsRes.json();
		initialiseMap();
		isInitialising = initialise();
	});
	let activeTab: string = $state('Assets');
	let tabs = [
		{ id: 'Assets', label: 'Assets' },
		{ id: 'Products', label: 'Products' }
	];

	if (dataset && dataset.properties && dataset.properties.tags) {
		let tags = dataset.properties.tags;
		let tool = tags.find((t) => t.key === 'algorithm');
		registeredTools = tags.filter((t) => t.key === 'algorithm');
		const algorithmLink = dataset.properties.links?.find((l) => l.rel === 'algorithms');
		if (algorithmLink && tool) {
			tabs.push({ id: 'Tools', label: 'Tools' });
		}
	}

	const handleSelectedProducts = async () => {
		selectedAsset = '';
		assetSelectionDone = !assetSelectionDone;
		if (!selectedProduct || clickedFeatures.length === 0 || !collection) return;
		if (clickedFeatures.length > 1) {
			clickedFeatures = [clickedFeatures.at(-1)];
			for (let i = 0; i < clickedFeatures.length - 1; i++) {
				map.setFeatureState(clickedFeatures[i], { click: false });
			}
		}
		isLoading = true;
		try {
			const ProductRes = await fetch(
				`/api/stac/${stacId}/${collection}/products/${selectedProduct}`
			);
			Product = await ProductRes.json();
			for (const f of clickedFeatures.slice(0, clickedFeatures.length - 1)) {
				map.setFeatureState(f, { click: false });
			}
			if (clickedFeatures.length > 1) {
				clickedFeatures = [clickedFeatures.at(-1)];
			}
			const itemIds = clickedFeatures.map((f) => f.properties.id);
			metadata = undefined;
			stacDatasetFeature = undefined;
			stacDatasetFeature = await getProductFeature(itemIds);
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	};

	const getProductFeature = async (itemIds: string[]) => {
		// send post request to server to get product feature
		const url = `/api/stac/${stacId}/${collection}/${itemIds.join('/')}/products`;

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(Product)
		});
		if (!res.ok) {
			stacDatasetFeature = undefined;
		} else {
			stacDatasetFeature = await res.json();
		}

		return stacDatasetFeature;
	};

	const mapResize = () => {
		if (!map) return;
		map.redraw();
		map.resize();
	};

	let assetList: string[] = $state([]);

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
			maxZoom: MAX_ZOOM
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
			stacDatasetFeature = undefined;
			if (features.length === 0) {
				return;
			}
			const feature = features[0];
			const index = clickedFeatures.findIndex((f) => f.properties.id === feature.properties.id);

			if (index > -1) {
				map.setFeatureState(feature, { click: false });
				clickedFeatures.splice(index, 1);
				clickedFeatures = [...clickedFeatures];
			} else {
				map.setFeatureState(feature, { click: true });
				clickedFeatures = [...clickedFeatures, feature];
				if (activeTab === 'Products' && clickedFeatures.length > 1) {
					for (const feat of clickedFeatures.slice(0, clickedFeatures.length - 1)) {
						map.setFeatureState(feat, { click: false });
					}
					clickedFeatures = [clickedFeatures.at(-1)];
					map.setFeatureState(clickedFeatures.at(-1), { click: true });
				}
			}

			if (clickedFeatures.length === 0) return;
			if (!selectedAsset && !selectedProduct && !selectedTool) return;

			isLoading = true;
			try {
				const itemIds = clickedFeatures.map((f) => f.properties.id);
				metadata = undefined;
				if (selectedAsset) {
					stacDatasetFeature = await getAssetFeature(itemIds);
				}
				if (selectedProduct) {
					for (const f of clickedFeatures.slice(0, clickedFeatures.length - 1)) {
						map.setFeatureState(f, { click: false });
					}
					if (!Product) {
						await handleSelectedProducts();
					}
					clickedFeatures = [clickedFeatures.at(-1)];
					const itemIds = clickedFeatures.map((f) => f.properties.id);
					map.setFeatureState(clickedFeatures[0], { click: true });
					stacDatasetFeature = await getProductFeature(itemIds);
				}

				toolSelectionComplete = checkToolSelectionComplete();

				if (toolSelectionComplete && clickedFeatures.length > 0) {
					for (const f of clickedFeatures.slice(0, clickedFeatures.length - 1)) {
						map.setFeatureState(f, { click: false });
					}
					clickedFeatures = [clickedFeatures.at(-1)];
					const itemIds = clickedFeatures.map((f) => f.properties.id);
					map.setFeatureState(clickedFeatures[0], { click: true });
					stacDatasetFeature = await getToolsFeature(itemIds);
				}
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

	const removeClickedFeature = (feature?: MapGeoJSONFeature) => {
		if (feature) {
			map.setFeatureState(feature, { click: false });
			clickedFeatures = [...clickedFeatures.filter((f) => f !== feature)];
		} else {
			for (const feature of clickedFeatures) {
				map.setFeatureState(feature, { click: false });
			}
			clickedFeatures = [];
		}
	};

	const handleSelectedAssets = async () => {
		selectedProduct = '';
		assetSelectionDone = !assetSelectionDone;

		if (clickedFeatures.length === 0) return;
		if (!collection) return;
		if (!selectedAsset) return;
		isLoading = true;
		try {
			const ids = clickedFeatures.map((f) => f.properties.id);
			stacDatasetFeature = undefined;
			metadata = undefined;
			stacDatasetFeature = await getAssetFeature(ids);
		} finally {
			isLoading = false;
		}
	};

	const getAssetFeature = async (itemIds: string[]) => {
		const url = `/api/stac/${stacId}/${collection}/${itemIds.join('/')}/${selectedAsset}`;
		try {
			const res = await fetch(url);
			if (!res.ok) {
				stacDatasetFeature = undefined;
			} else {
				const feature = await res.json();
				if (!feature.properties.url) {
					stacDatasetFeature = undefined;
				} else {
					stacDatasetFeature = feature;
				}
			}
		} catch {
			stacDatasetFeature = undefined;
		}

		return stacDatasetFeature;
	};

	const handleShowOnMap = async () => {
		if (!stacDatasetFeature) return;
		isLoading = true;
		try {
			const type = stacDatasetFeature.properties.tags?.find((t) => t.key === 'stacType')?.value;

			if (type === 'mosaicjson' && clickedFeatures.length > 1 && sceneType === 'scene') {
				// mosaicjson, but user selected add data as scenes
				// fetch feature by scenes from server
				const asset = stacDatasetFeature.properties.tags?.find((t) => t.key === 'asset');
				const itemIds = stacDatasetFeature.properties.tags?.filter((t) => t.key === 'item');
				const dataArray = [];
				for (const item of itemIds) {
					let url: string;
					let feature: DatasetFeature;
					if (selectedProduct) {
						url = `${page.url.origin}/api/stac/${stacId}/${collection}/${item.value}/products/${selectedProduct}`;
						const res = await fetch(url);
						feature = await res.json();
					} else {
						url = `${page.url.origin}/api/stac/${stacId}/${collection}/${item.value}/${asset.value}`;
						const res = await fetch(url);
						feature = await res.json();
					}

					const rasterTile = new RasterTileData(feature);

					const data: LayerCreationInfo & { geohubLayer?: Layer } = await rasterTile.add(
						undefined,
						undefined,
						layerCreationInfo.colormap_name,
						selectedAlgorithmName ?? null
					);

					data.geohubLayer = {
						id: data.layer.id,
						name: feature.properties.name as string,
						info: data.metadata,
						dataset: feature,
						colorMapName: data.colormap_name
					};

					dataArray.push(data);
				}
				if (onDataAdded) onDataAdded(dataArray);

				return;
			} else {
				if (selectedAlgorithmName) {
					const rasterTile = new RasterTileData(stacDatasetFeature);
					const data: LayerCreationInfo & { geohubLayer?: Layer } = await rasterTile.add(
						undefined,
						undefined,
						selectedTool?.outputs?.colormap_name,
						selectedAlgorithmName
					);
					data.geohubLayer = {
						id: data.layer.id,
						name: stacDatasetFeature.properties.name,
						info: data.metadata,
						dataset: stacDatasetFeature,
						colorMapName: data.colormap_name
					};

					if (onDataAdded) onDataAdded([data]);
				} else {
					const data: LayerCreationInfo & { geohubLayer?: Layer } = layerCreationInfo;
					if (data && data.layer) {
						data.geohubLayer = {
							id: data.layer.id,
							name: stacDatasetFeature.properties.name as string,
							info: data.metadata,
							dataset: stacDatasetFeature,
							colorMapName: data.colormap_name
						};
						if (onDataAdded) onDataAdded([data]);
					}
				}
			}
		} finally {
			isLoading = false;
		}
	};

	const handleLayerAdded = (data: LayerCreationInfo) => {
		layerCreationInfo = data;
	};

	const handleTabChange = () => {
		if (activeTab === 'Products') {
			selectedAsset = '';
			selectedTool = '';
			selectedAlgorithmName = '';
			toolSelectionComplete = false;
		}
		if (activeTab === 'Assets') {
			selectedProduct = '';
			selectedTool = '';
			selectedAlgorithmName = '';
			toolSelectionComplete = false;
		}
		if (activeTab === 'Tools') {
			selectedAsset = '';
			selectedProduct = '';
		}
	};

	const handleSelectedTool = async () => {
		if (selectedAlgorithmName === '') return;
		const algorithmLink = dataset.properties.links.find((l) => l.rel === 'algorithms').href;
		const res = await fetch(`${algorithmLink}/${selectedAlgorithmName}`);
		selectedTool = await res.json();
		populateDefaultToolAssets();
		toolSelectionComplete = checkToolSelectionComplete();
	};

	const getToolsFeature = async (ids) => {
		const itemsUrl = dataset.properties.url;
		const itemRes = await fetch(`${itemsUrl}/${ids}`);
		const itemsJSON = await itemRes.json();
		const assetUrls = Object.values(selectedToolAssets).map((v) => itemsJSON.assets[`${v}`].href);
		// create a vrt from the asset urls
		let vrtUrl = dataset.properties.links.find((l) => l.rel === 'vrt')?.href;
		if (!vrtUrl) return;
		const urlParameters = assetUrls.map((url) => `url=${url}`).join('&');
		vrtUrl = `${vrtUrl.indexOf('localhost') === -1 ? vrtUrl : '/vrt'}?${urlParameters}`;
		const algorithmName = selectedTool.title ?? selectedTool.algorithmId;
		let feature: DatasetFeature = JSON.parse(JSON.stringify(dataset));
		feature.geometry = itemsJSON.geometry;
		feature.properties.url = vrtUrl;
		feature.properties.id = generateHashKey(vrtUrl);
		feature.properties.is_raster = true;
		feature.properties.name = `${feature.properties.name} (${algorithmName})`;
		const assetTags = Object.values(selectedToolAssets).map((name) => {
			return { key: 'asset', value: itemsJSON.assets[`${name}`].href };
		});

		feature.properties.links?.forEach((link) => {
			const newLink = new URL(link.href);
			if (newLink.searchParams.get('url')) {
				newLink.searchParams.set('url', vrtUrl);
				link.href = newLink.href;
			}
		});

		feature.properties.tags;
		feature.properties.tags = [
			{ key: 'type', value: 'api' },
			...feature.properties.tags,
			...assetTags
		];
		const url = `/api/stac/algorithms/${selectedAlgorithmName}`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(feature)
		});
		return await res.json();
	};

	const handleSelectedToolAsset = async () => {
		// assuming the feature on map has been clicked......
		const numberOfBands = selectedTool.inputs.nbands;
		const bandsInToolAssets = Object.values(selectedToolAssets).filter((b) => b !== '');
		if (bandsInToolAssets.length === numberOfBands) {
			toolSelectionComplete = true;
			assetSelectionDone = !assetSelectionDone;
			if (clickedFeatures.length > 0) {
				const ids = clickedFeatures.map((f) => f.properties.id);
				stacDatasetFeature = await getToolsFeature(ids);
			}
		}
	};

	const populateDefaultToolAssets = () => {
		if (!selectedTool) return;
		const bands = selectedTool.inputs.bands;
		for (let i = 0; i < bands.length; i++) {
			const band = bands[i];
			const keywords = band.keywords;
			if (keywords?.length > 0) {
				for (const keyword of keywords) {
					for (const asset of assetList) {
						if (asset.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
							selectedToolAssets[i] = asset;
							break;
						}
					}
				}
			}
		}
	};

	const checkToolSelectionComplete = () => {
		if (!selectedTool) return false;
		const numberOfBands = selectedTool.inputs.nbands;
		const bandsInToolAssets = Object.values(selectedToolAssets).filter((b) => b !== '');
		return clickedFeatures.length > 0 && bandsInToolAssets.length === numberOfBands;
	};

	let mapHeight = $derived(height > 0 ? height : innerHeight * 0.6);
	$effect(() => {
		if (isLoading !== undefined) {
			untrack(() => {
				setMapInteractive();
			});
		}
	});
	$effect(() => {
		if (mapHeight !== undefined) {
			untrack(() => {
				mapResize();
			});
		}
	});

	$effect(() => {
		if (clickedFeatures.length > 0 && toolSelectionComplete) {
			const ids = clickedFeatures.map((f) => f.properties.id);
			getToolsFeature(ids).then((feature) => {
				stacDatasetFeature = feature;
			});
		}
	});
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
					{#snippet control()}
						<div>
							<div class="select is-small is-fullwidth">
								<select
									bind:value={searchLimit}
									disabled={isLoading}
									onchange={handleMapExtentChanged}
								>
									{#each StacSearchLimitOptions as limit (limit)}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					{/snippet}
				</FieldControl>

				{#if temporalIntervalFrom && temporalIntervalTo && temporalIntervalFrom.toString() !== temporalIntervalTo.toString()}
					<div class="is-flex">
						<FieldControl title="Search from" showHelp={false} fontWeight="bold">
							{#snippet control()}
								<div class="mr-1">
									<DatePicker
										bind:value={searchDateFrom}
										bind:min={temporalIntervalFrom}
										bind:max={temporalIntervalTo}
										format="MM/DD/YYYY"
										size="small"
										width={85}
										onselect={handleSearchParameterChanged}
									/>
								</div>
							{/snippet}
						</FieldControl>
						<FieldControl title="Search to" showHelp={false} fontWeight="bold">
							{#snippet control()}
								<div>
									<DatePicker
										bind:value={searchDateTo}
										bind:min={temporalIntervalFrom}
										bind:max={temporalIntervalTo}
										format="MM/DD/YYYY"
										size="small"
										width={85}
										onselect={handleSearchParameterChanged}
									/>
								</div>
							{/snippet}
						</FieldControl>
					</div>

					<div class="select is-fullwidth">
						<select bind:value={selectedDateFilterOption} onchange={handleDateFilterOptionChanged}>
							{#each StacDateFilterOptions as option (option.value)}
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
							{#snippet control()}
								<div>
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
										onchange={handleSearchParameterChanged}
									/>
								</div>
							{/snippet}
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
				{#if AvailableProducts.find((p) => p.collection_id === collection) && assetList.length > 1}
					<Tabs
						{tabs}
						bind:activeTab
						onchange={handleTabChange}
						isCentered={true}
						isBoxed={false}
						isUppercase
						size="is-small"
						fontWeight="bold"
					/>
				{/if}
				{#if stacItemFeatureCollection?.features?.length > 0}
					{@const feature = stacItemFeatureCollection.features[0]}
					{#if activeTab === 'Assets'}
						<FieldControl title="Please select an asset" showHelp={false}>
							{#snippet control()}
								<div>
									<div class="select is-link is-fullwidth">
										<select
											bind:value={selectedAsset}
											onchange={handleSelectedAssets}
											disabled={isLoading}
										>
											{#if assetList.length > 1}
												<option value="">Select an asset</option>
											{/if}
											{#each assetList as assetName (assetName)}
												{@const asset = feature.assets[assetName]}
												<option value={assetName}>{asset?.title ? asset.title : assetName}</option>
											{/each}
										</select>
									</div>
								</div>
							{/snippet}
						</FieldControl>
					{:else if activeTab === 'Products'}
						<FieldControl title="Please select a product" showHelp={false}>
							{#snippet control()}
								<div>
									<div class="select is-link is-fullwidth">
										<select
											bind:value={selectedProduct}
											onchange={handleSelectedProducts}
											disabled={isLoading}
										>
											{#if AvailableProducts.find((p) => p.collection_id === collection)}
												<option value="">Select a product</option>
												{#each AvailableProducts as product (product.product_id)}
													<option value={product.product_id}>{product.description}</option>
												{/each}
											{:else}
												<option value="">No product available</option>
											{/if}
										</select>
									</div>
								</div>
							{/snippet}
						</FieldControl>
					{:else if activeTab === 'Tools'}
						<FieldControl title="Please select a tool" showHelp={false}>
							{#snippet control()}
								<div>
									<div class="select is-link is-fullwidth">
										<select
											bind:value={selectedAlgorithmName}
											onchange={handleSelectedTool}
											disabled={isLoading}
										>
											<option value="">Select a tool</option>
											{#each registeredTools as tool (tool.value)}
												<option value={tool.value}>{clean(tool.value)}</option>
											{/each}
										</select>
									</div>
								</div>
							{/snippet}
						</FieldControl>
						{#if selectedAlgorithmName && selectedTool}
							<!-- eslint-disable-next-line no-unused-vars -->
							{#each selectedTool.inputs.bands as band (band)}
								{@const index = selectedTool.inputs.bands.indexOf(band)}
								{@const bandTitle = selectedTool.inputs.bands[index].title}
								<FieldControl title={`Please select the ${bandTitle}`} showHelp={true}>
									{#snippet control()}
										<div>
											<div class="select is-link is-fullwidth">
												<select
													bind:value={selectedToolAssets[index]}
													onchange={async () => await handleSelectedToolAsset()}
													disabled={isLoading}
												>
													{#if assetList.length > 1}
														<option value="">Select an asset</option>
													{/if}
													{#each assetList as assetName (assetName)}
														{@const asset = feature.assets[assetName]}
														<option value={assetName}
															>{asset.title ? asset.title : assetName}</option
														>
														<option value={assetName}
															>{asset.title ? asset.title : assetName}</option
														>
													{/each}
												</select>
											</div>
										</div>
									{/snippet}
									{#snippet help()}
										<div>{selectedTool.inputs.bands[index].description}</div>
									{/snippet}
								</FieldControl>
							{/each}
						{/if}
					{/if}
				{/if}

				{#if clickedFeatures.length > 0}
					<Notification type="info" showCloseButton={false}>
						{clickedFeatures.length} item{clickedFeatures.length > 1 ? 's' : ''} selected.
					</Notification>
					<div class="my-2">
						<ShowDetails bind:show={showDetails} />
					</div>
					{#if showDetails}
						<table class="table is-narrow is-hoverable is-fullwidth">
							<thead>
								<tr>
									<th>No.</th>
									<th>Datetime</th>
									{#if stacInstance.hasCloudCoverProp}
										<th>Cloud cover (%)</th>
									{/if}
									<th>
										<button
											class="delete-button"
											onclick={() => {
												removeClickedFeature();
											}}
											use:tooltipTippy={{ content: 'Clear all selected features' }}
										>
											<span class="material-symbols-outlined"> clear_all </span>
										</button>
									</th>
								</tr>
							</thead>
							<tbody>
								{#each clickedFeatures as feature, index (clickedFeatures.indexOf(feature))}
									<tr>
										<td>{index + 1}</td>
										<td
											><Time
												timestamp={feature.properties.datetime}
												format="HH:mm, MM/DD/YYYY"
											/></td
										>
										{#if stacInstance.hasCloudCoverProp}
											<td
												>{feature.properties[stacInstance.cloudCoverPropName as string].toFixed(
													2
												)}%</td
											>
										{/if}
										<td>
											<button
												class="delete-button"
												onclick={() => {
													removeClickedFeature(feature);
												}}
												use:tooltipTippy={{ content: `Deselect No. ${index + 1} feature` }}
											>
												<span class="material-symbols-outlined"> remove_selection </span>
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}

					{#if stacDatasetFeature && (selectedAsset || selectedProduct || selectedAlgorithmName)}
						{#key assetSelectionDone}
							{#if selectedAlgorithmName}
								<Notification type="warning" showCloseButton={false}>
									No preview available for tools. Please click on "Show it on map" to add the data
									to the map.
								</Notification>
							{:else}
								<MiniMap
									feature={stacDatasetFeature}
									isLoadMap={true}
									width="100%"
									height="200px"
									{metadata}
									onLayerAdded={handleLayerAdded}
								/>
							{/if}
							<div class="mt-2">
								{#if clickedFeatures.length > 1}
									<!-- svelte-ignore a11y_label_has_associated_control -->
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
								{#if layerCreationInfo || (toolSelectionComplete && clickedFeatures.length > 0)}
									<button
										class="mt-2 button is-primary is-fullwidth has-text-weight-bold is-uppercase {isLoading
											? 'is-loading'
											: ''}"
										onclick={handleShowOnMap}
										disabled={isLoading}
										><p class="has-text-weight-semibold">Show it on map</p></button
									>
								{/if}
							</div>
						{/key}
					{:else}
						{@const unsupportedAsset = !stacDatasetFeature && clickedFeatures.length > 0}

						<Notification
							type={unsupportedAsset ? 'warning' : 'info'}
							showCloseButton={false}
							showIcon={false}
						>
							{#if unsupportedAsset}
								Selected asset item is not supported, please try another item or asset.
							{:else}
								You have selected {clickedFeatures.length} feature{clickedFeatures.length > 1
									? 's'
									: ''} on the map. To do preview it, please select an asset from the above select box.
							{/if}
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
				pointer-events: none;
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
				z-index: 999;

				max-height: 90%;
				overflow-y: auto;
			}
		}
	}
</style>
