<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { resolveRelativeUrl } from '$lib/helper';
	import type {
		Link,
		StacCatalog,
		StacCatalogBreadcrumb,
		StacCollection,
		StacItemFeature,
		TableViewType
	} from '$lib/types';
	import { Pagination } from '@undp-data/svelte-undp-design';
	import {
		Map,
		MapMouseEvent,
		NavigationControl,
		Popup,
		type LngLatBoundsLike,
		type MapGeoJSONFeature,
		type RasterLayerSpecification
	} from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { v4 as uuidv4 } from 'uuid';

	const dispatch = createEventDispatcher();

	export let url: string;
	export let links: Link[] = [];

	let stacCollections: StacCollection[] = [];
	let stacItems: StacItemFeature[] = [];
	let stacCatalogs: StacCatalog[] = [];

	let viewType: TableViewType = 'map';

	let totalPages = 0;
	let currentPage = 0;
	let numberOfItemsPerPage = 15;
	let childLinks: Link[] = [];
	let sourceIds: string[] = [];
	let startIndex = 0;
	let endIndex = 0;

	// progress bar
	let showProgressBar = false;
	let maxProgress = 0;
	let currentProgress = 0;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let height = 0;
	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;

	let popup: Popup | undefined;
	let popupContainer: HTMLDivElement;
	let clickedFeature: MapGeoJSONFeature;
	let hoveredFeatures: MapGeoJSONFeature[] = [];

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
		childLinks = links.filter((l) => ['child', 'item'].includes(l.rel));

		totalPages = Math.ceil(childLinks.length / numberOfItemsPerPage);
		currentPage = 1;

		await loadNextItems();
	};

	const loadNextItems = async () => {
		startIndex = currentPage === 1 ? 0 : (currentPage - 1) * numberOfItemsPerPage;
		endIndex = startIndex + numberOfItemsPerPage;
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

				addCollecitonBBOXToMap(childUrl, childItem);
			}

			if (childItem.type === 'Collection') {
				stacCollections = [...stacCollections, childItem];
			} else if (childItem.type === 'Feature') {
				stacItems = [...stacItems, childItem];
			} else if (childItem.type === 'Catalog') {
				stacCatalogs = [...stacCatalogs, childItem];
			}

			currentProgress++;
		}

		if (stacCatalogs.length > 0) {
			viewType = 'list';
		}

		showProgressBar = false;

		if (maxBounds) {
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
					['boolean', ['feature-state', 'hover'], false],
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
	};

	const handleClickFeature = (e: MapMouseEvent) => {
		if (!('features' in e)) return;
		clickedFeature = e.features[0];
		if (popup) {
			popup.remove();
			popup = undefined;
		}
		popup = new Popup()
			.setLngLat(e.lngLat)
			.setMaxWidth('400px')
			.setDOMContent(popupContainer)
			.addTo(map);
	};

	const handleExploreCollection = (feature: MapGeoJSONFeature) => {
		const data: StacCatalogBreadcrumb = {
			title: feature.properties.title,
			url: feature.properties.url,
			type: feature.properties.type
		};
		dispatch('selected', data);
	};

	onMount(() => {
		initialiseMap();
		map.once('load', initialise);
	});

	const handleViewTypeChanged = (type: TableViewType) => {
		viewType = type;
	};

	const handleTableCollectionClicked = (data: StacCatalogBreadcrumb) => {
		dispatch('selected', data);
	};

	const getItemByIndex = (index: number) => {
		const item =
			stacCollections.length > 0
				? stacCollections[index]
				: stacItems.length > 0
				  ? stacItems[index]
				  : stacCatalogs.length > 0
				    ? stacCatalogs[index]
				    : undefined;
		return item as StacCatalog | StacCollection | StacItemFeature;
	};

	const getDatetime = (index: number) => {
		const item = getItemByIndex(index);

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
</script>

<svelte:window bind:innerHeight />

{#if links && links.length > 0}
	<div class="columns is-multiline is-mobile is-vcentered">
		<div class="column">
			<Pagination bind:totalPages bind:currentPage on:clicked={loadNextItems} />
		</div>
		<div class="column">
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
		<div class="column">
			<div class="field has-addons is-flex is-justify-content-flex-end">
				{#if stacCatalogs.length === 0}
					<p class="control">
						<button
							class="button {viewType === 'map' ? 'is-link' : ''}"
							on:click={() => handleViewTypeChanged('map')}
						>
							<span class="icon is-small">
								<i class="fa-solid fa-map fa-lg"></i>
							</span>
							<span>Map view</span>
						</button>
					</p>
				{/if}
				<p class="control">
					<button
						class="button {viewType === 'list' ? 'is-link' : ''}"
						on:click={() => handleViewTypeChanged('list')}
					>
						<span class="icon is-small">
							<i class="fa-solid fa-list"></i>
						</span>
						<span>List view</span>
					</button>
				</p>
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
						<th>
							{#if childLinks?.length > 0 && childLinks[0].rel === 'item'}
								Datetime
							{:else}
								Description
							{/if}
						</th>
						<th>Type</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{#each childLinks.slice(startIndex, endIndex) as child, index}
						{@const selfUrl = resolveRelativeUrl(child.href, url)}
						{@const item = getItemByIndex(index)}
						{#if item}
							<tr>
								{#if item.type === 'Catalog'}
									<td>{item.title}</td>
									<td>{item.description}</td>
									<td>
										<button
											class="button is-link"
											on:click={() => {
												handleTableCollectionClicked({
													title: item.title,
													url: selfUrl,
													type: item.type
												});
											}}>Explore</button
										>
									</td>
								{:else}
									{@const title = 'title' in item ? item.title : item.id}
									{@const type = child.rel === 'item' ? 'Item' : 'Collection'}
									{@const datetime = getDatetime(index)}

									<td>{title}</td>
									<td>
										{#if datetime}
											{#if datetime.length === 1}
												<Time timestamp={datetime[0]} format="HH:mm, MM/DD/YYYY" />
											{:else}
												<Time
													timestamp={datetime[datetime.length - 1]}
													format="HH:mm, MM/DD/YYYY"
												/>
											{/if}
										{:else if 'description' in item}
											{item.description}
										{:else}
											N/A
										{/if}
									</td>
									<td>{type}</td>
									<td>
										<button
											class="button is-link"
											on:click={() => {
												handleTableCollectionClicked({
													title: title,
													url: selfUrl,
													type: type
												});
											}}>Explore</button
										>
									</td>
								{/if}
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<div class="popup" bind:this={popupContainer}>
	{#if clickedFeature}
		{@const title = clickedFeature.properties.title}
		{@const type = clickedFeature.properties.type}
		{@const description = clickedFeature.properties.description}
		{@const license = clickedFeature.properties.license}
		<div class="container p-2">
			<p class="has-text-weight-bold is-size-5 py-2">{title}</p>

			<button
				class="button is-primary is-normal"
				on:click={() => {
					handleExploreCollection(clickedFeature);
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

	.popup {
		width: 300px;
		max-width: 350px;
		max-height: 200px;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
