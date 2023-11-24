<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { resolveRelativeUrl } from '$lib/helper';
	import type { StacCatalog, StacCollection } from '$lib/types';
	import { Accordion } from '@undp-data/svelte-undp-design';
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

	let stacCatalog: StacCatalog;
	let stacCollections: StacCollection[] = [];
	let isMetadataExpanded = true;

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

	const initialiseCatalog = async () => {
		const res = await fetch(url);
		stacCatalog = await res.json();
		const children = stacCatalog.links.filter((l) => l.rel === 'child');

		let maxBounds: LngLatBoundsLike;

		maxProgress = children.length;
		currentProgress = 1;
		showProgressBar = true;

		for (const child of children) {
			const childUrl = resolveRelativeUrl(child.href, url);
			const resChild = await fetch(childUrl);
			const collection = await resChild.json();

			const extent = collection.extent.spatial.bbox[0];
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

			addCollecitonBBOXToMap(childUrl, collection);
			stacCollections.push(collection);

			currentProgress++;
		}

		showProgressBar = false;

		if (maxBounds) {
			map.fitBounds(maxBounds);
		}
	};

	const addCollecitonBBOXToMap = (collectionUrl: string, collection: StacCollection) => {
		const extent = collection.extent.spatial.bbox[0];
		const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
		const layerId = collection.id;
		const collectionFeature = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: center
			},
			properties: {
				id: layerId,
				title: collection.title,
				license: collection.license,
				description: collection.description,
				url: collectionUrl
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
		const collectionUrl = feature.properties.url;
		dispatch('selected', {
			title: title,
			url: collectionUrl,
			type: 'Collection'
		});
	};

	onMount(() => {
		initialiseMap();
		initialiseCatalog();
	});
</script>

<svelte:window bind:innerHeight />

{#if stacCatalog}
	{@const childrenLinks = stacCatalog.links.filter((l) => l.rel === 'child')}
	<Accordion headerTitle="metadata" isExpanded={isMetadataExpanded}>
		<div slot="content">
			<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
				<tr><th>STAC version</th><td>{stacCatalog.stac_version}</td></tr>
				<tr><th>Description</th><td>{stacCatalog.description}</td></tr>
				{#if stacCatalog.license}
					<tr><th>License</th><td>{stacCatalog.license}</td></tr>
				{/if}
			</table>
		</div>
	</Accordion>

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

<div class="catalog-explorer" style="height: {mapHeight}px;">
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
				Show this collection
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

	.catalog-explorer {
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
