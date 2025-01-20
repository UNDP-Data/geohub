<script lang="ts">
	import { page } from '$app/state';
	import type { StoryMapChapter } from '$lib/types';
	import { createMapLibreGlMapController } from '@maptiler/geocoding-control/maplibregl';
	import GeocodingControl from '@maptiler/geocoding-control/svelte/GeocodingControl.svelte';
	import type { MapController } from '@maptiler/geocoding-control/types';
	import {
		layerTypes,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, Slider } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import maplibregl, {
		Map,
		Marker,
		NavigationControl,
		Popup,
		type StyleSpecification
	} from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	interface Props {
		chapter?: StoryMapChapter | undefined;
		onchange?: () => void;
	}

	let { chapter = $bindable(undefined), onchange = () => {} }: Props = $props();

	let locationMapContainer: HTMLDivElement | undefined = $state();
	let locationMap: Map | undefined = $state();
	let locationMarker: Marker | undefined = $state();
	let tempLocation: { center: [number, number]; zoom: number; bearing: number; pitch: number } =
		$state();

	let mapBearing = $state([0]);
	let mapPitch = $state([0]);

	let apiKey = page.data.maptilerKey;
	let mapController: MapController | undefined = $state();
	let popupContainer: HTMLDivElement | undefined = $state();

	export const updateMapStyle = debounce(() => {
		if (!locationMap) return;
		if (chapter) {
			tempLocation = JSON.parse(JSON.stringify(chapter.location));
		} else {
			tempLocation = JSON.parse(JSON.stringify($configStore.location));
		}

		applyLayerEvent().then((style) => {
			if (!chapter) {
				tempLocation.center = tempLocation.center ?? style.center;
				tempLocation.zoom = tempLocation.zoom ?? style.zoom;
				tempLocation.bearing = tempLocation.bearing ?? style.bearing;
				tempLocation.pitch = tempLocation.pitch ?? style.pitch;
			} else {
				if ($configStore.location?.center && $configStore.location.center[0] !== null) {
					// if center is not undefined, use location from config
					tempLocation.bearing = $configStore.location.bearing ?? 0;
					tempLocation.pitch = $configStore.location.pitch ?? 0;
					tempLocation.center = $configStore.location.center;
					tempLocation.zoom = $configStore.location.zoom;
				}
			}
			locationMap?.setStyle(style);
		});
	});

	const updateMarkerPosition = debounce(() => {
		if (!locationMap) return;
		if (!popupContainer) return;

		if (!tempLocation) {
			if (chapter) {
				tempLocation = JSON.parse(JSON.stringify(chapter.location));
			} else {
				tempLocation = JSON.parse(JSON.stringify($configStore.location));
			}
		}

		const lngLat = locationMap.getCenter();

		tempLocation.center = [lngLat.lng, lngLat.lat];
		tempLocation.zoom = locationMap.getZoom();
		mapBearing = [locationMap.getBearing()];
		mapPitch = [locationMap.getPitch()];

		if (!locationMarker) {
			locationMarker = new Marker().setLngLat(tempLocation.center).addTo(locationMap);
		} else {
			locationMarker.setLngLat(tempLocation.center);
		}

		const popup = new Popup().setDOMContent(popupContainer);
		locationMarker.setPopup(popup);
	}, 300);

	const applyMarkerPosition = () => {
		tempLocation.bearing = mapBearing[0];
		tempLocation.pitch = mapPitch[0];
		if (!chapter) {
			$configStore.location = tempLocation;
		} else {
			chapter.location = tempLocation;
		}
		if (onchange) onchange();
	};

	const resetMarkerPosition = async () => {
		if (!locationMap) return;

		if (chapter) {
			tempLocation = JSON.parse(JSON.stringify(chapter.location));
			locationMap.setCenter(tempLocation.center);
			locationMap.setZoom(tempLocation.zoom);
			locationMap.setBearing(tempLocation.bearing);
			locationMap.setPitch(tempLocation.pitch);
		} else {
			const style = await applyLayerEvent();
			tempLocation = {
				center: style.center ? [style.center[0], style.center[1]] : [0, 0],
				zoom: style.zoom ?? 0,
				bearing: style.bearing ?? 0,
				pitch: style.pitch ?? 0
			};
		}
		locationMap.setCenter(tempLocation.center);
		locationMap.setZoom(tempLocation.zoom);
		locationMap.setBearing(tempLocation.bearing);
		locationMap.setPitch(tempLocation.pitch);
	};

	const handleBearingChanged = debounce(() => {
		tempLocation.bearing = parseInt(`${mapBearing[0]}`);
		locationMap?.setBearing(tempLocation.bearing);
	}, 300);

	const handlePitchChanged = debounce(() => {
		tempLocation.pitch = parseInt(`${mapPitch[0]}`);
		locationMap?.setPitch(tempLocation.pitch);
	}, 300);

	const handleGeocodingSelected = (e) => {
		const feature = e.detail;
		if (feature) {
			locationMap?.flyTo({ center: feature.center, zoom: 12 });
		}
	};

	onMount(async () => {
		const style = await applyLayerEvent();
		if (!locationMapContainer) return;
		locationMap = new Map({
			container: locationMapContainer,
			style: style,
			attributionControl: false,
			maxPitch: 85
		});
		locationMap.addControl(
			new NavigationControl({ visualizePitch: true, showCompass: true }),
			'bottom-right'
		);

		mapController = createMapLibreGlMapController(locationMap, maplibregl);

		locationMap.on('moveend', updateMarkerPosition);
		locationMap.on('pitchend', updateMarkerPosition);
	});

	const applyLayerEvent = async () => {
		let mapStyle: StyleSpecification;

		const orgStyle = chapter ? chapter.style : $configStore.style;

		if (typeof orgStyle === 'string') {
			const res = await fetch(orgStyle);
			mapStyle = await res.json();
		} else {
			mapStyle = JSON.parse(JSON.stringify(orgStyle));
		}

		if (chapter) {
			mapStyle.bearing = chapter.location.bearing;
			mapStyle.pitch = chapter.location.pitch;
			mapStyle.center = chapter.location.center;
			mapStyle.zoom = chapter.location.zoom;
		} else {
			if ($configStore.location?.center && $configStore.location.center[0] !== null) {
				// if center is not undefined, use location from config
				mapStyle.bearing = $configStore.location.bearing;
				mapStyle.pitch = $configStore.location.pitch;
				mapStyle.center = $configStore.location.center;
				mapStyle.zoom = $configStore.location.zoom;
			}
		}
		tempLocation = {
			center: mapStyle.center ? [mapStyle.center[0], mapStyle.center[1]] : [0, 0],
			zoom: mapStyle.zoom ?? 0,
			bearing: mapStyle.bearing ?? 0,
			pitch: mapStyle.pitch ?? 0
		};

		chapter?.onChapterEnter?.forEach((layer: { layer: string; opacity: number }) => {
			const index = mapStyle.layers.findIndex((l) => l.id === layer.layer);
			if (index === -1) return;
			const l = mapStyle.layers[index];
			const props = layerTypes[l.type];
			if (props && props.length > 0) {
				props.forEach((prop: number) => {
					mapStyle.layers[index].paint[prop] = layer.opacity;
				});
			} else {
				const visibility = layer.opacity === 0 ? 'none' : 'visible';
				mapStyle.layers[index].layout.visibility = visibility;
			}
		});
		return mapStyle;
	};
</script>

<FieldControl title="Search location by name." showHelp={true} showHelpPopup={false}>
	{#snippet control()}
		<div>
			<div class="geocoding">
				{#if locationMap && mapController}
					<GeocodingControl
						{mapController}
						{apiKey}
						{maplibregl}
						showResultsWhileTyping={false}
						flyTo={false}
						flyToSelected={false}
						limit={5}
						on:pick={handleGeocodingSelected}
					/>
				{:else}
					<div class="is-flex is-justify-content-center">
						<Loader size="small" />
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet help()}
		<div>
			{#if locationMap && mapController}
				Type <b>Enter</b> key to search locations.
			{/if}
		</div>
	{/snippet}
</FieldControl>

<FieldControl
	title="or move a pin to change the location"
	isFirstCharCapitalized={false}
	showHelp={false}
>
	{#snippet control()}
		<div>
			<div class="map" bind:this={locationMapContainer}></div>
		</div>
	{/snippet}
</FieldControl>

<div bind:this={popupContainer}>
	{#if tempLocation}
		<table>
			<thead>
				<tr>
					<th>Longitude</th>
					<th>Latitude</th>
					<th>Zoom</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{tempLocation.center[0].toFixed(6)}</td>
					<td>{tempLocation.center[1].toFixed(6)}</td>
					<td>{tempLocation.zoom.toFixed(1)}</td>
				</tr>
			</tbody>
		</table>
	{/if}
</div>

{#if tempLocation}
	{@const resetDisabled =
		(chapter && JSON.stringify(tempLocation) === JSON.stringify(chapter.location)) ||
		(!chapter && JSON.stringify(tempLocation) === JSON.stringify($configStore.location))}
	<div class="is-flex is-flex-direction-column mt-2">
		<FieldControl title="Bearing" showHelp={true}>
			{#snippet control()}
				<div>
					<Slider
						min={-179}
						max={180}
						bind:values={mapBearing}
						floatLabel
						pips
						pipstep={1}
						rest={false}
						suffix="°"
						on:change={handleBearingChanged}
					/>
				</div>
			{/snippet}
			{#snippet help()}
				<div>
					Default bearing, in degrees. The bearing is the compass direction that is "up"; for
					example, a bearing of 90° orients the map so that east is up.
				</div>
			{/snippet}
		</FieldControl>

		<FieldControl title="Pitch" showHelp={true}>
			{#snippet control()}
				<div>
					<Slider
						min={0}
						max={85}
						bind:values={mapPitch}
						floatLabel
						pips
						pipstep={1}
						rest={false}
						suffix="°"
						on:change={handlePitchChanged}
					/>
				</div>
			{/snippet}
			{#snippet help()}
				<div>
					Default pitch, in degrees. Zero is perpendicular to the surface, for a look straight down
					at the map, while a greater value like 60 looks ahead towards the horizon.
				</div>
			{/snippet}
		</FieldControl>
	</div>

	<div class="mt-4">
		<button
			class="button is-link is-uppercase has-text-weight-bold"
			disabled={resetDisabled}
			onclick={applyMarkerPosition}
		>
			Apply to slide
		</button>
		<button
			class="reset-button button is-light is-uppercase has-text-weight-bold"
			disabled={resetDisabled}
			onclick={resetMarkerPosition}
		>
			Reset
		</button>
	</div>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		width: 100%;
		height: 218px;
		border: 1px solid #d4d6d8;
	}

	.geocoding {
		:global(form) {
			width: 328px !important;
			max-width: 328px !important;
		}
		:global(.input-group) {
			border-radius: 0 !important;
			border: 1px solid black;
			width: 328px;
			height: 43px;
		}
	}

	.reset-button {
		box-shadow: none !important;

		&.is-light {
			background-color: #edeff0 !important;
		}
	}
</style>
