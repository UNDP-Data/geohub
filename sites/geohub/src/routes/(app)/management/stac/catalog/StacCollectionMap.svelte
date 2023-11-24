<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { resolveRelativeUrl } from '$lib/helper';
	import type { Link, StacCollection, StacItemFeature } from '$lib/types';
	import {
		Map,
		NavigationControl,
		Popup,
		type LngLatBoundsLike,
		type MapGeoJSONFeature
	} from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let url: string;
	export let links: Link[] = [];

	let stacCollections: StacCollection[] = [];
	let stacItems: StacItemFeature[] = [];

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

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 0,
			maxZoom: 10
		});

		map.addControl(new NavigationControl(), 'bottom-left');

		map.once('load', () => {
			map.resize();
			map.redraw();
		});
	};

	const initialise = async () => {
		const children = links.filter((l) => ['child', 'item'].includes(l.rel));

		let maxBounds: LngLatBoundsLike;

		maxProgress = children.length;
		currentProgress = 1;
		showProgressBar = true;

		stacCollections = [];
		stacItems = [];

		for (const child of children) {
			const childUrl = resolveRelativeUrl(child.href, url);
			const resChild = await fetch(childUrl);
			const childItem = await resChild.json();

			const extent =
				childItem.type === 'Collection' ? childItem.extent.spatial.bbox[0] : childItem.bbox;
			if (!maxBounds) {
				maxBounds = [
					[extent[0], extent[1]],
					[extent[2], extent[3]]
				];
			} else {
				if (extent[0] < maxBounds[0][0]) {
					maxBounds[0][0] = extent[0];
				}
				if (extent[1] < maxBounds[0][1]) {
					maxBounds[0][1] = extent[1];
				}
				if (extent[2] > maxBounds[1][0]) {
					maxBounds[1][0] = extent[2];
				}
				if (extent[3] > maxBounds[1][1]) {
					maxBounds[1][1] = extent[3];
				}
			}

			addCollecitonBBOXToMap(childUrl, childItem);
			if (childItem.type === 'Collection') {
				stacCollections.push(childItem);
			} else if (childItem.type === 'Item') {
				stacItems.push(childItem);
			}

			currentProgress++;
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
		const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
		const layerId = item.id;
		const collectionFeature = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: center
			},
			properties: {
				id: layerId,
				title: (item as StacCollection).title ?? layerId,
				license: (item as StacCollection).license,
				description: (item as StacCollection).description,
				url: collectionUrl,
				type: item.type === 'Collection' ? 'Collection' : 'Item'
			}
		};

		map.addSource(layerId, {
			type: 'geojson',
			data: collectionFeature,
			promoteId: 'id'
		});
		map.addLayer({
			id: `${layerId}-circle`,
			type: 'circle',
			source: layerId,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'circle-blur': 0,
				'circle-opacity': 1,
				'circle-color': '#006eb5',
				'circle-radius': 7,
				'circle-stroke-color': '#FFFFFF',
				'circle-stroke-opacity': 1,
				'circle-stroke-width': 1
			}
		});
		map.addLayer({
			id: `${layerId}-label`,
			type: 'symbol',
			source: layerId,
			layout: {
				visibility: 'visible',
				'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
				'text-radial-offset': 1,
				'text-justify': 'auto',
				'text-field': ['get', 'title'],
				'text-font': ['Proxima Nova Semibold'],
				'text-max-width': 10,
				'text-size': 12
			},
			paint: {
				'text-halo-color': '#FFFFFF',
				'text-halo-width': 1
			}
		});

		map.on('click', `${layerId}-circle`, (e) => {
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
		});
	};

	const handleExploreCollection = (feature: MapGeoJSONFeature) => {
		const title = feature.properties.title;
		const type = feature.properties.type;
		const collectionUrl = feature.properties.url;
		dispatch('selected', {
			title: title,
			url: collectionUrl,
			type: type
		});
	};

	onMount(() => {
		initialiseMap();
		initialise();
	});
</script>

<svelte:window bind:innerHeight />

{#if links && links.length > 0}
	{@const childrenLinks = links.filter((l) => ['child', 'item'].includes(l.rel))}

	<div class="py-2">
		<Notification>
			{#if childrenLinks.length === 0}
				No colleciton founds
			{:else}
				{childrenLinks.length} colleciton{childrenLinks.length === 1 ? '' : 's'} found
			{/if}
		</Notification>
	</div>
{/if}

<div class="collection-explorer" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map"></div>
	{#if showProgressBar}
		<div class="progress-container p-2">
			<progress class="progress my-0" value={currentProgress} max={maxProgress}></progress>
			<span>loaded {currentProgress} / {maxProgress} </span>
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
