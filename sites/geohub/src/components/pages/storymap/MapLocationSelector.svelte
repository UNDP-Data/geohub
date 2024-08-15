<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import { layerTypes } from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, Slider } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { Map, Marker, NavigationControl, type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapter;

	let locationMapContainer: HTMLDivElement;
	let locationMap: Map;
	let locationMarker: Marker;
	let tempLocation: { center: [number, number]; zoom: number; bearing: number; pitch: number };

	let mapBearing = [0];
	let mapPitch = [0];

	export const updateMapStyle = debounce(() => {
		if (!locationMap) return;
		if (!chapter) return;

		tempLocation = JSON.parse(JSON.stringify(chapter.location));

		applyLayerEvent().then((style) => {
			locationMap.setStyle(style);
		});
	});

	const updateMarkerPosition = debounce(() => {
		if (!locationMap) return;
		if (!chapter) return;
		if (!tempLocation) {
			tempLocation = JSON.parse(JSON.stringify(chapter.location));
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
	}, 300);

	const applyMarkerPosition = () => {
		tempLocation.bearing = mapBearing[0];
		tempLocation.pitch = mapPitch[0];
		chapter.location = tempLocation;
		dispatch('change');
	};

	const resetMarkerPosition = () => {
		if (!locationMap) return;
		if (!chapter) return;

		tempLocation = JSON.parse(JSON.stringify(chapter.location));

		locationMap.setCenter(tempLocation.center);
		locationMap.setZoom(tempLocation.zoom);
		locationMap.setBearing(tempLocation.bearing);
		locationMap.setPitch(tempLocation.pitch);
	};

	const handleBearingChanged = debounce(() => {
		tempLocation.bearing = parseInt(`${mapBearing[0]}`);
		locationMap.setBearing(tempLocation.bearing);
	}, 300);

	const handlePitchChanged = debounce(() => {
		tempLocation.pitch = parseInt(`${mapPitch[0]}`);
		locationMap.setPitch(tempLocation.pitch);
	}, 300);

	onMount(async () => {
		if (!locationMapContainer) return;
		const style = await applyLayerEvent();

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

		locationMap.on('moveend', updateMarkerPosition);
		locationMap.on('pitchend', updateMarkerPosition);
	});

	const applyLayerEvent = async () => {
		let mapStyle: StyleSpecification;
		if (typeof chapter.style === 'string') {
			const res = await fetch(chapter.style);
			mapStyle = await res.json();
		} else {
			mapStyle = JSON.parse(JSON.stringify(chapter.style));
		}

		mapStyle.bearing = chapter.location.bearing;
		mapStyle.pitch = chapter.location.pitch;
		mapStyle.center = chapter.location.center;
		mapStyle.zoom = chapter.location.zoom;

		chapter.onChapterEnter?.forEach((layer: { layer: string; opacity: number }) => {
			const index = mapStyle.layers.findIndex((l) => l.id === layer.layer);
			if (index === -1) return;
			const l = mapStyle.layers[index];
			const props = layerTypes[l.type];
			if (!(props && props.length > 0)) return;
			props.forEach((prop: number) => {
				mapStyle.layers[index].paint[prop] = layer.opacity;
			});
		});
		return mapStyle;
	};
</script>

{#if tempLocation?.center && tempLocation?.zoom}
	<FieldControl
		title="Center position (Longitude, Latitude, Zoom)"
		isFirstCharCapitalized={false}
		showHelp={false}
	>
		<div slot="control">
			{tempLocation.center.map((c) => c.toFixed(6)).join(', ')}, {tempLocation.zoom.toFixed(1)}
		</div>
	</FieldControl>
{/if}

<div class="map" bind:this={locationMapContainer} />

{#if tempLocation}
	{@const resetDisabled = JSON.stringify(tempLocation) === JSON.stringify(chapter.location)}
	<div class="is-flex is-flex-direction-column mt-2">
		<FieldControl title="Bearing" showHelp={true}>
			<div slot="control">
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
			<div slot="help">
				Default bearing, in degrees. The bearing is the compass direction that is "up"; for example,
				a bearing of 90° orients the map so that east is up.
			</div>
		</FieldControl>

		<FieldControl title="Pitch" showHelp={true}>
			<div slot="control">
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
			<div slot="help">
				Default pitch, in degrees. Zero is perpendicular to the surface, for a look straight down at
				the map, while a greater value like 60 looks ahead towards the horizon.
			</div>
		</FieldControl>
	</div>

	<div class="mt-4">
		<button
			class="button is-link is-uppercase has-text-weight-bold"
			disabled={resetDisabled}
			on:click={applyMarkerPosition}
		>
			Apply to slide
		</button>
		<button
			class="button is-uppercase has-text-weight-bold"
			disabled={resetDisabled}
			on:click={resetMarkerPosition}
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
</style>
