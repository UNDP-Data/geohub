<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapChapter as StoryMapChapterType, StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		createMapStyleStore,
		layerTypes,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		StoryMapChapter,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map, NavigationControl, type StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';

	export let chapter: StoryMapChapterType;
	export let width = '100%';
	export let height = '100%';

	let mapContainer: HTMLDivElement;

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate;

	let navigationControl: NavigationControl;

	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	let mapStyle: StyleSpecification;

	onMount(async () => {
		const newStyle = await applyLayerEvent();

		$mapStore = new Map({
			container: mapContainer,
			style: newStyle,
			interactive: false,
			attributionControl: false
		});
		$mapStore.addControl(
			new AttributionControl({ compact: false, customAttribution: attribution }),
			'bottom-right'
		);
		updateMapStyle();

		configStore.subscribe(updateMapStyle);
	});

	const applyLayerEvent = async () => {
		if (!mapStyle) {
			if (typeof chapter.style === 'string') {
				const res = await fetch(chapter.style);
				mapStyle = await res.json();
			} else {
				mapStyle = chapter.style;
			}
		}

		const newStyle: StyleSpecification = JSON.parse(JSON.stringify(mapStyle));
		chapter.onChapterEnter?.forEach((layer) => {
			const index = newStyle.layers.findIndex((l) => l.id === layer.layer);
			if (index === -1) return;
			const l = newStyle.layers[index];
			const props = layerTypes[l.type];
			if (!(props && props.length > 0)) return;
			props.forEach((prop) => {
				newStyle.layers[index].paint[prop] = layer.opacity;
			});
		});
		return newStyle;
	};

	$: chapter, updateMapStyle();
	const updateMapStyle = debounce(async () => {
		if (!$mapStore) return;
		if (!chapter) return;
		if (!mapStyle) return;

		$mapStore.setBearing(chapter.location.bearing);
		$mapStore.setPitch(chapter.location.pitch);

		const location = { zoom: chapter.location.zoom, center: chapter.location.center };
		if (chapter.mapAnimation === 'easeTo') {
			$mapStore.easeTo(location);
		} else if (chapter.mapAnimation === 'jumpTo') {
			$mapStore.jumpTo(location);
		} else {
			$mapStore.flyTo(location);
		}

		const newStyle = await applyLayerEvent();
		$mapStore.setStyle(newStyle);

		if (navigationControl && $mapStore.hasControl(navigationControl)) {
			$mapStore.removeControl(navigationControl);
		}
		if (chapter.mapInteractive) {
			const navPosition = chapter.mapNavigationPosition ?? 'top-right';
			if (!navigationControl) {
				navigationControl = new NavigationControl();
			}
			$mapStore.addControl(navigationControl, navPosition);

			$mapStore.scrollZoom.disable(); //disable scrollZoom because it will conflict with scrolling chapters
			$mapStore.boxZoom.enable();
			$mapStore.dragRotate.enable();
			$mapStore.dragPan.enable();
			$mapStore.keyboard.enable();
			$mapStore.doubleClickZoom.enable();
			$mapStore.touchZoomRotate.enable();
			$mapStore.touchPitch.enable();
			$mapStore.getCanvas().style.cursor = 'grab';
		} else {
			$mapStore.scrollZoom.disable();
			$mapStore.boxZoom.disable();
			$mapStore.dragRotate.disable();
			$mapStore.dragPan.disable();
			$mapStore.keyboard.disable();
			$mapStore.doubleClickZoom.disable();
			$mapStore.touchZoomRotate.disable();
			$mapStore.touchPitch.disable();
			$mapStore.getCanvas().style.cursor = 'default';
		}

		$mapStore.once('styledata', () => {
			if (chapter.rotateAnimation) {
				const rotateNumber = $mapStore.getBearing();
				$mapStore.rotateTo(rotateNumber + 180, {
					duration: 30000,
					easing: function (t) {
						return t;
					}
				});
			} else if (chapter.spinGlobe) {
				const center = $mapStore.getCenter();
				const newCenter: [number, number] = [center.lng + 360, center.lat];
				$mapStore.easeTo({ center: newCenter, duration: 20000, easing: (n) => n });
			}
		});
		template_id = ($configStore as StoryMapConfig).template_id;
	}, 300);
</script>

<div class="map" style="width: {width}; height: {height};" bind:this={mapContainer} />
<div class="overlay" style="width: {width}; height: {height};">
	<StoryMapChapter bind:chapter bind:activeId={chapter.id} bind:template={template_id} />
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;
	}

	.overlay {
		padding-top: 20vh;

		:global(.center) {
			min-width: 50% !important;
			max-width: 70% !important;
			margin-left: 10vw !important;
		}

		:global(.left) {
			width: 50% !important;
			margin-left: 5vw !important;
		}

		:global(.right) {
			width: 50% !important;
			margin-left: auto !important;
			margin-right: 5vw !important;
		}

		:global(.full) {
			margin-left: 5vw !important;
			margin-right: 5vw !important;
			width: 85% !important;
		}
	}
</style>
