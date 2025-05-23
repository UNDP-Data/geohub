<script lang="ts">
	import RasterBandSelectbox from '$components/pages/data/datasets/RasterBandSelectbox.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { MapStyles } from '$lib/config/AppConfig';
	import { isRgbRaster, resolveRelativeUrl } from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		LayerCreationInfo,
		Link,
		StacAsset,
		StacCatalog,
		StacCatalogBreadcrumb,
		StacCollection,
		StacDataLayer,
		StacItemFeature,
		TableViewType
	} from '$lib/types';
	import {
		Notification,
		SegmentButtons,
		handleEnterKey,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Loader, Pagination } from '@undp-data/svelte-undp-design';
	import {
		Map,
		NavigationControl,
		Popup,
		type LngLatBoundsLike,
		type MapGeoJSONFeature,
		type MapMouseEvent,
		type RasterLayerSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';
	import { v4 as uuidv4 } from 'uuid';

	interface Props {
		stacId: string;
		collectionUrl?: string;
		url: string;
		links?: Link[];
		onDataAdded?: (layers: StacDataLayer[]) => void;
		onSelected?: (breadcrumb: StacCatalogBreadcrumb) => void;
	}

	let {
		stacId,
		collectionUrl = '',
		url,
		links = [],
		onDataAdded = () => {},
		onSelected = () => {}
	}: Props = $props();

	let stacCollections: StacCollection[] = $state([]);
	let stacItems: StacItemFeature[] = $state([]);
	let stacCatalogs: StacCatalog[] = $state([]);

	let viewType: TableViewType = $state('map');

	let totalPages = $state(0);
	let currentPage = $state(0);
	let numberOfItemsPerPage = 15;
	let sourceIds: string[] = [];
	let startIndex = 0;
	let endIndex = 0;

	// progress bar
	let showProgressBar = $state(false);
	let maxProgress = $state(0);
	let currentProgress = $state(0);

	let mapContainer: HTMLDivElement = $state();
	let map: Map;
	let height = 0;
	let innerHeight: number = $state();

	let popup: Popup | undefined;
	let popupContainer: HTMLDivElement = $state();
	let popedFeature: MapGeoJSONFeature = $state();
	let popedFeatures: MapGeoJSONFeature[] = $state();
	let hoveredFeatures: MapGeoJSONFeature[] = [];

	let sceneType: 'scene' | 'mosaic' = $state('scene');
	let isItemView = $state(false);
	let clickedFeatures: MapGeoJSONFeature[] = $state([]);
	let itemFeature: StacItemFeature = $state();
	let selectedAssetName: string = $state();
	let isLoading = $state(false);
	let rasterTile: RasterTileData;
	let metadata: RasterTileMetadata = $state();
	let isRgbTile = $state(false);
	let selectedBand = $state('');
	let layerData: LayerCreationInfo;
	let datasetFeature: DatasetFeature;
	let popupMapContainer: HTMLDivElement = $state();
	let popupMap: Map;
	let serverError = $state(false);

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 0,
			maxZoom: 14
		});

		map.addControl(new NavigationControl(), 'bottom-left');

		map.once('load', () => {
			map.resize();
			map.redraw();
		});
	};

	const initialise = async () => {
		isItemView = links.filter((l) => l.rel === 'item').length > 0;
		const childLinks = links.filter((l) => ['child', 'item'].includes(l.rel));

		totalPages = Math.ceil(childLinks.length / numberOfItemsPerPage);
		currentPage = 1;

		await loadNextItems();
	};

	const loadNextItems = async () => {
		startIndex = currentPage === 1 ? 0 : (currentPage - 1) * numberOfItemsPerPage;
		endIndex = startIndex + numberOfItemsPerPage;
		await loadItems();
	};

	const loadItems = async (zoomToBounds = true) => {
		const childLinks = links.filter((l) => ['child', 'item'].includes(l.rel));
		const children: Link[] = childLinks.slice(startIndex, endIndex);

		if (sourceIds?.length > 0) {
			const style = map.getStyle();
			sourceIds.forEach((src) => {
				const layers = style.layers.filter((l: RasterLayerSpecification) => l.source === src);
				layers.forEach((l) => {
					if (map.getLayer(l.id)) {
						map.removeLayer(l.id);
					}
				});
				if (map.getSource(src)) {
					map.removeSource(src);
				}
			});
			sourceIds = [];
		}

		let maxBounds: LngLatBoundsLike;

		maxProgress = children.length;
		currentProgress = 1;
		showProgressBar = true;

		stacCollections = [];
		stacItems = [];
		stacCatalogs = [];
		itemFeature = undefined;
		if (popup) {
			popup.remove();
			popup = undefined;
		}
		hoveredFeatures = [];
		popedFeatures = undefined;
		clickedFeatures = [];
		datasetFeature = undefined;

		for (const child of children) {
			const childUrl = resolveRelativeUrl(child.href, url);
			const resChild = await fetch(childUrl);
			const childItem = await resChild.json();

			if (childItem.type !== 'Catalog') {
				const extent =
					childItem.type === 'Collection' ? childItem.extent.spatial.bbox[0] : childItem.bbox;
				if (!maxBounds) {
					maxBounds = [
						[extent[0], extent[1]],
						[extent[2], extent[3]]
					];
				} else {
					if (extent[0] < maxBounds[0][0] && extent[0] >= -180 && extent[0] <= 180) {
						maxBounds[0][0] = extent[0];
					}
					if (extent[1] < maxBounds[0][1] && extent[1] >= -90 && extent[1] <= 90) {
						maxBounds[0][1] = extent[1];
					}
					if (extent[2] > maxBounds[1][0] && extent[2] >= -180 && extent[2] <= 180) {
						maxBounds[1][0] = extent[2];
					}
					if (extent[3] > maxBounds[1][1] && extent[3] >= -90 && extent[3] <= 90) {
						maxBounds[1][1] = extent[3];
					}
				}
				let selfUrl = childItem.links.find((l) => l.rel === 'self');
				if (!selfUrl) {
					selfUrl = childItem.links.find((l) => l.rel === 'root');
				}
				if (selfUrl) {
					selfUrl.href = childUrl;
				}

				if (!childItem.links.find((l) => l.rel === 'self')) {
					const href: Link = JSON.parse(JSON.stringify(selfUrl));
					href.rel = 'self';
					childItem.links.push(href);
				}

				addCollecitonBBOXToMap(childUrl, childItem);
			}

			if (childItem.type === 'Collection') {
				stacCollections = [...stacCollections, childItem];
			} else if (childItem.type === 'Feature') {
				stacItems = [...stacItems, childItem];
			} else if (childItem.type === 'Catalog') {
				if (!childItem.links.find((l) => l.rel === 'self')) {
					let selfUrl: Link = childItem.links.find((l) => l.rel === 'self');
					if (!selfUrl) {
						childItem.links.push({
							rel: 'self',
							type: 'application/json',
							href: childUrl
						});
					}
				}
				stacCatalogs = [...stacCatalogs, childItem];
			}

			currentProgress++;
		}

		if (stacCatalogs.length > 0) {
			viewType = 'list';
		}

		showProgressBar = false;

		if (zoomToBounds && maxBounds) {
			map.fitBounds(maxBounds);
		}
	};

	const addCollecitonBBOXToMap = (
		collectionUrl: string,
		item: StacCollection | StacItemFeature
	) => {
		const extent =
			item.type === 'Collection'
				? (item as StacCollection).extent.spatial.bbox[0]
				: (item as StacItemFeature).bbox;

		const layerId = uuidv4();

		const properties = {
			id: layerId,
			title: (item as StacCollection).title ?? item.id,
			license: (item as StacCollection).license,
			description: (item as StacCollection).description,
			url: collectionUrl,
			type: item.type === 'Collection' ? 'Collection' : 'Item'
		};

		const fillSourceId = `${layerId}`;
		sourceIds.push(fillSourceId);
		const polygonFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[extent[0], extent[1]],
						[extent[0], extent[3]],
						[extent[2], extent[3]],
						[extent[2], extent[1]],
						[extent[0], extent[1]]
					]
				]
			},
			properties: properties
		};

		map.addSource(fillSourceId, {
			type: 'geojson',
			data: polygonFeature,
			promoteId: 'id'
		});

		map.addLayer({
			id: `${layerId}-fill`,
			type: 'fill',
			source: fillSourceId,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'fill-color': [
					'case',
					['boolean', ['feature-state', sceneType === 'scene' ? 'hover' : 'click'], false],
					'rgba(0,110,181, 0.6)',
					'rgba(0,110,181, 0.2)'
				],
				'fill-outline-color': '#006eb5'
			}
		});

		map.addLayer({
			id: `${layerId}-fill-label`,
			type: 'symbol',
			source: fillSourceId,
			layout: {
				visibility: 'visible',
				'text-field': ['get', 'title'],
				'text-font': ['Proxima Nova Semibold'],
				'text-max-width': 5,
				'text-size': 12
			},
			paint: {
				'text-halo-color': '#FFFFFF',
				'text-halo-width': 1,
				'text-color': '#d12800'
			}
		});

		map.on('click', `${layerId}-fill`, handleClickFeature);

		if (sceneType === 'scene') {
			map.on('mousemove', (e) => {
				for (const feature of hoveredFeatures) {
					map.setFeatureState(feature, { hover: false });
				}
				hoveredFeatures = [];
				const { x, y } = e.point;
				let features = map.queryRenderedFeatures([x, y]);
				features = features.filter((feature) => feature.source !== 'carto');
				for (const feature of features) {
					map.setFeatureState(feature, { hover: true });
					hoveredFeatures.push(feature);
				}
			});
		}
	};

	const handleClickFeature = async (e: MapMouseEvent) => {
		if (!('features' in e)) return;
		const { x, y } = e.point;
		let features = map.queryRenderedFeatures([x, y]);
		if (features.length === 0) {
			return;
		}
		features = features.filter((f) => sourceIds.includes(f.source));

		if (sceneType === 'scene') {
			popedFeatures = features as MapGeoJSONFeature[];
			popedFeature = popedFeatures[0];
			if (popup) {
				popup.remove();
				popup = undefined;
			}
			popup = new Popup()
				.setLngLat(e.lngLat)
				.setMaxWidth('400px')
				.setDOMContent(popupContainer)
				.addTo(map);
		} else {
			const { x, y } = e.point;
			const features = map.queryRenderedFeatures([x, y]);

			const feature = features[0];

			const index = clickedFeatures.findIndex((f) => f.properties.id === feature.properties.id);
			if (index > -1) {
				map.setFeatureState(feature, { click: false });
				clickedFeatures.splice(index, 1);
			} else {
				map.setFeatureState(feature, { click: true });
				clickedFeatures = [...clickedFeatures, feature];
			}

			if (clickedFeatures?.length > 1) {
				if (popup) {
					popup.remove();
					popup = undefined;
				}
				const itemUrl = clickedFeatures[0].properties.url;
				const res = await fetch(itemUrl);
				itemFeature = await res.json();

				// if there is an asset named 'visual' or 'preview', use it for default asset
				const visualIndex = Object.keys(itemFeature.assets).findIndex(
					(key) =>
						key.toLowerCase().indexOf('visual') !== -1 ||
						key.toLowerCase().indexOf('preview') !== -1
				);
				if (visualIndex !== -1) {
					selectedAssetName = Object.keys(itemFeature.assets)[visualIndex];
				}
				handleSelectAsset();

				popup = new Popup()
					.setLngLat(e.lngLat)
					.setMaxWidth('400px')
					.setDOMContent(popupContainer)
					.addTo(map);
			}
		}
	};

	const handleExploreCollection = (feature: MapGeoJSONFeature) => {
		const data: StacCatalogBreadcrumb = {
			title: feature.properties.title,
			dataUrl: feature.properties.url,
			type: feature.properties.type
		};
		if (onSelected) onSelected(data);
	};

	onMount(() => {
		initialiseMap();
		map.once('load', initialise);
	});

	const handleViewTypeChanged = () => {
		if (viewType === 'list') {
			sceneType = 'scene';
		}
	};

	const handleTableCollectionClicked = (data: StacCatalogBreadcrumb) => {
		if (onSelected) onSelected(data);
	};

	const getDatetime = (item: StacItemFeature) => {
		if ('properties' in item) {
			let datetime: string[] = [];
			if (item.properties.datetime) {
				datetime = [item.properties.datetime];
			}
			if (!datetime) {
				if (item.properties.start_datetime && item.properties.end_datetime) {
					datetime = [item.properties.start_datetime, item.properties.end_datetime];
				}
			}
			return datetime;
		}
	};

	const handleSelectAsset = async () => {
		rasterTile = undefined;
		metadata = undefined;
		isRgbTile = undefined;
		selectedBand = undefined;
		datasetFeature = undefined;
		serverError = false;

		if (!selectedAssetName) return;

		isLoading = true;

		try {
			const urls = clickedFeatures.map((f) => `url=${f.properties.url}`);
			const apiUrl = `/api/stac/catalog/${stacId}/item?asset=${selectedAssetName}&collection=${collectionUrl}&${urls.join(
				'&'
			)}`;
			const res = await fetch(apiUrl);
			datasetFeature = await res.json();

			rasterTile = new RasterTileData(datasetFeature);
			metadata = (await rasterTile.getMetadata()) as RasterTileMetadata;
			isRgbTile = metadata?.colorinterp ? isRgbRaster(metadata.colorinterp) : false;
			if (isRgbTile) {
				initialisePopupMap();
			}
		} catch {
			serverError = true;
		} finally {
			isLoading = false;
		}
	};

	const initialisePopupMap = async () => {
		serverError = false;
		isLoading = true;
		try {
			if (!rasterTile) return;
			if (!isRgbTile && !selectedBand) return;
			popupMap = new Map({
				container: popupMapContainer,
				style: MapStyles[0].uri,
				center: [0, 0],
				zoom: 0,
				maxZoom: 14
			});

			popupMap.addControl(new NavigationControl(), 'bottom-left');

			popupMap.once('load', () => {
				popupMap.resize();
				popupMap.redraw();
			});

			const asset = itemFeature.assets[selectedAssetName];
			const bands = getBandDescription(asset);
			const bandIndex = bands.findIndex((b) => b.name === selectedBand);
			layerData = await rasterTile.add(popupMap, bandIndex + 1);
		} catch {
			serverError = true;
		} finally {
			isLoading = false;
		}
	};

	const getBandDescription = (asset: StacAsset) => {
		const bands: { name: string; description: string }[] = [];
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
					description: b.description as string
				});
			});
		}
		return bands;
	};

	const handleBandSelected = async () => {
		isLoading = true;

		try {
			await initialisePopupMap();
		} finally {
			isLoading = false;
		}
	};

	const handleShowMosaic = () => {
		const data: LayerCreationInfo & { geohubLayer?: Layer } = layerData;

		data.geohubLayer = {
			id: data.layer.id,
			name: datasetFeature.properties.name as string,
			info: data.metadata,
			dataset: datasetFeature,
			colorMapName: data.colormap_name
		};
		if (onDataAdded) onDataAdded([data]);
	};

	const getViewTypes = () => {
		let items = [{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }];
		if (stacCatalogs.length === 0) {
			items = [{ title: 'Map', icon: 'fa-solid fa-map', value: 'map' }, ...items];
		}
		return items;
	};
	let mapHeight = $derived(height > 0 ? height : innerHeight * 0.6);
</script>

<svelte:window bind:innerHeight />

{#if links && links.length > 0}
	{@const childLinks = links.filter((l) => ['child', 'item'].includes(l.rel))}
	<div class="is-flex is-align-items-center mb-2">
		<div class="">
			<Notification showCloseButton={false}>
				{#if childLinks.length === 0}
					No {stacCatalogs.length > 0
						? 'catalog'
						: stacCollections.length > 0
							? 'collection'
							: 'item'} founds
				{:else}
					{numberOfItemsPerPage > childLinks.length ? childLinks.length : numberOfItemsPerPage} of
					{childLinks.length}
					{stacCatalogs.length > 0
						? 'catalog'
						: stacCollections.length > 0
							? 'collection'
							: 'item'}{childLinks.length === 1 ? '' : 's'} shown
				{/if}
			</Notification>
		</div>

		<div class="is-flex align-right pt-1">
			{#if isItemView && viewType === 'map'}
				<div class="field has-addons is-flex is-justify-content-flex-end">
					<SegmentButtons
						buttons={[
							{ title: 'Scene', icon: 'fa-regular fa-square', value: 'scene' },
							{ title: 'Mosaic', icon: 'fa-solid fa-grip', value: 'mosaic' }
						]}
						bind:selected={sceneType}
						onchange={() => {
							loadItems(false);
						}}
					/>
				</div>
			{/if}

			<div class="pl-1 is-flex is-justify-content-flex-end">
				{#key stacCatalogs}
					<SegmentButtons
						buttons={getViewTypes()}
						bind:selected={viewType}
						onchange={handleViewTypeChanged}
					/>
				{/key}
			</div>
		</div>
	</div>
{/if}

<div class="collection-explorer" style="height: {mapHeight}px;" hidden={viewType !== 'map'}>
	<div bind:this={mapContainer} class="map"></div>
	{#if showProgressBar}
		<div class="progress-container p-2">
			<progress class="progress is-success my-0" value={currentProgress} max={maxProgress}
			></progress>
			<span>loaded {currentProgress} / {maxProgress} </span>
		</div>
	{/if}
</div>

<div class="is-flex is-justify-content-center pt-1">
	<Pagination bind:totalPages bind:currentPage onclick={loadNextItems} hidden={totalPages <= 1} />
</div>

<div class="list-explorer" hidden={viewType !== 'list'}>
	{#if showProgressBar}
		<div class="progress-container p-2">
			<progress class="progress is-success my-0" value={currentProgress} max={maxProgress}
			></progress>
			<span>loaded {currentProgress} / {maxProgress} </span>
		</div>
	{:else}
		<div class="table-container">
			<table class="table is-striped is-narrow is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Name</th>
						<th> Description </th>
						<th>Type</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{#each stacCatalogs as catalog (catalog.id)}
						{@const self = catalog.links.find((l) => l.rel === 'self')}
						{@const selfUrl = resolveRelativeUrl(self.href, url)}
						<tr>
							<td>{catalog.title}</td>
							<td>{catalog.description}</td>
							<td>
								<button
									class="button is-link is-uppercase has-text-weight-bold"
									onclick={() => {
										handleTableCollectionClicked({
											title: catalog.title,
											dataUrl: selfUrl,
											type: catalog.type
										});
									}}>Explore</button
								>
							</td>
						</tr>
					{/each}

					{#each stacCollections as collection (collection.id)}
						{@const self = collection.links.find((l) => l.rel === 'self')}
						{@const selfUrl = resolveRelativeUrl(self.href, url)}
						{@const title = collection.title ?? collection.id}
						{@const type = 'Collection'}
						<tr>
							<td>{title}</td>
							<td>
								{collection.description ?? 'N/A'}
							</td>
							<td>{type}</td>
							<td>
								<button
									class="button is-link is-uppercase has-text-weight-bold"
									onclick={() => {
										handleTableCollectionClicked({
											title: title,
											dataUrl: selfUrl,
											type: type
										});
									}}>Explore</button
								>
							</td>
						</tr>
					{/each}

					{#each stacItems as item (item.id)}
						{@const self = item.links.find((l) => l.rel === 'self')}
						{#if self}
							{@const selfUrl = resolveRelativeUrl(self.href, url)}
							{@const title = item.id}
							{@const type = 'Item'}
							{@const datetime = getDatetime(item)}
							<tr>
								<td>{title}</td>
								<td>
									{#if datetime}
										{#if datetime.length === 1}
											<Time timestamp={datetime[0]} format="HH:mm, MM/DD/YYYY" />
										{:else}
											<Time timestamp={datetime[datetime.length - 1]} format="HH:mm, MM/DD/YYYY" />
										{/if}
									{:else}
										N/A
									{/if}
								</td>
								<td>{type}</td>
								<td>
									<button
										class="button is-link is-uppercase has-text-weight-bold"
										onclick={() => {
											handleTableCollectionClicked({
												title: title,
												dataUrl: selfUrl,
												type: type
											});
										}}>Explore</button
									>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<div class="popup" bind:this={popupContainer}>
	{#if popedFeatures}
		{#if popedFeatures.length > 1}
			<div class="tabs is-small mb-2">
				<ul>
					{#each popedFeatures as f, index (popedFeatures.indexOf(f))}
						<li class={popedFeature === f ? 'is-active' : ''}>
							<!-- svelte-ignore a11y_missing_attribute -->
							<a
								role="tab"
								tabindex="0"
								data-sveltekit-preload-data="off"
								data-sveltekit-preload-code="off"
								onclick={() => {
									popedFeature = f;
								}}
								onkeydown={handleEnterKey}
							>
								{index + 1}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if popedFeature}
			{@const title = popedFeature.properties.title}
			{@const type = popedFeature.properties.type}
			{@const description = popedFeature.properties.description}
			{@const license = popedFeature.properties.license}
			<div class="container p-2">
				<p class="has-text-weight-bold is-size-5 pt-2 pb-4 wrap">{title}</p>

				<button
					class="button is-primary is-uppercase has-text-weight-bold"
					onclick={() => {
						handleExploreCollection(popedFeature);
					}}
				>
					Show this {type}
				</button>

				{#if license}
					<p class="is-size-6 py-2">License: {license}</p>
				{/if}

				{#if description}
					<p class="is-size-6 py-2 has-text-justified">{description}</p>
				{/if}
			</div>
		{/if}
	{:else if clickedFeatures.length > 1}
		{#if itemFeature?.assets}
			<div class="field">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="label">Please select an asset</label>
				<div class="control">
					<div class="select is-link is-fullwidth">
						<select
							bind:value={selectedAssetName}
							onchange={handleSelectAsset}
							disabled={isLoading}
						>
							{#if Object.keys(itemFeature.assets).length > 1}
								<option value="">Select an asset</option>
							{/if}
							{#each Object.keys(itemFeature.assets) as assetName (assetName)}
								{@const asset = itemFeature.assets[assetName]}
								<!-- it is preferred to use `image/tiff; application=geotiff; profile=cloud-optimized` to check asset type,
						but we found some of COG from some STAC server, they don't put `profile=cloud-optimized`.
						So I removed profile from validation. -->
								{#if asset.type.indexOf('image/tiff; application=geotiff') !== -1}
									<option value={assetName}>{asset.title ? asset.title : assetName}</option>
								{/if}
							{/each}
						</select>
					</div>
				</div>
			</div>
		{/if}

		{#if selectedAssetName}
			{#if metadata && !isRgbTile}
				{@const asset = itemFeature.assets[selectedAssetName]}
				{@const bands = getBandDescription(asset)}
				<div class="field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="label">Please select a raster band</label>
					<div class="control">
						<RasterBandSelectbox
							bind:metadata
							bind:selectedBand
							bandsDetail={bands}
							disabled={isLoading}
							onchange={handleBandSelected}
						/>
					</div>
				</div>
			{/if}

			{#if serverError}
				<Notification type="danger">Server is not responding. Please try later.</Notification>
			{:else}
				<div class="assets-explorer mt-1" style="height: 200px;">
					<div bind:this={popupMapContainer} class="map"></div>
					{#if isLoading}
						<div class="loader-container"><Loader size="large" /></div>
					{/if}
				</div>
			{/if}

			<button
				class="mt-2 button is-primary is-uppercase has-text-weight-bold is-fullwidth"
				onclick={handleShowMosaic}
				disabled={isLoading}
			>
				Show selected items
			</button>
		{/if}
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.collection-explorer {
		position: relative;
		width: 100%;

		.map {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.progress-container {
			position: absolute;
			width: 300px;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 10;
			background-color: white;
		}
	}

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

	.popup {
		width: 300px;
		max-width: 350px;
		max-height: 500px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.align-right {
		margin-left: auto;
	}

	.wrap {
		overflow-wrap: break-word;
	}
</style>
