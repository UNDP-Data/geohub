<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapChapter as StoryMapChapterType, StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		createMapStyleStore,
		layerTypes,
		MaplibreLegendControl,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		StoryMapChapter,
		StoryMapFooter,
		StoryMapHeader,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map, NavigationControl, type StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';

	export let chapter: StoryMapChapterType | undefined = undefined;
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

		$mapStore.once('load', () => {
			const sky = new SkyControl();
			sky.addTo($mapStore, { timeType: 'solarNoon' });
		});

		configStore.subscribe(updateMapStyle);
	});

	const applyLayerEvent = async () => {
		if (chapter) {
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
				if (props && props.length > 0) {
					props.forEach((prop) => {
						newStyle.layers[index].paint[prop] = layer.opacity;
					});
				} else {
					const visibility = layer.opacity === 0 ? 'none' : 'visible';
					newStyle.layers[index].layout.visibility = visibility;
				}
			});

			return newStyle;
		} else {
			if (!mapStyle) {
				if (typeof $configStore.style === 'string') {
					const res = await fetch($configStore.style);
					mapStyle = await res.json();
				} else {
					mapStyle = $configStore.style;
				}
			}

			return mapStyle;
		}
	};

	$: chapter, updateMapStyle();
	const updateMapStyle = debounce(async () => {
		if (!$mapStore) return;
		if (!mapStyle) return;

		if (chapter) {
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
		}

		const newStyle = await applyLayerEvent();
		$mapStore.setStyle(newStyle);

		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;

		if (!chapter) return;

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
	}, 300);
</script>

<div class="map" style="width: {width}; height: {height};" bind:this={mapContainer}>
	{#if $mapStore && chapter && chapter.style_id && chapter.showLegend}
		{#key chapter}
			<MaplibreLegendControl
				bind:map={$mapStore}
				bind:styleId={chapter.style_id}
				bind:position={chapter.legendPosition}
			/>
		{/key}
	{/if}
</div>

{#if chapter}
	<div class="overlay" style="width: {width}; height: {height};">
		<StoryMapChapter bind:chapter bind:activeId={chapter.id} bind:template={template_id} />
	</div>

	{#if $configStore}
		{@const lastChapter = $configStore.chapters[$configStore.chapters.length - 1]}
		{#if lastChapter.id === chapter.id}
			<div class="footer-overlay" style="width: {width};">
				<StoryMapFooter bind:template={template_id} />
			</div>
		{/if}
	{/if}
{:else}
	<div class="is-flex is-align-items-center" style="width: {width}; height: {height};">
		<StoryMapHeader bind:template={template_id} />
	</div>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;
	}

	.overlay {
		padding-top: 18vh;

		:global(.full) {
			margin: 0 auto !important;
			// margin-left: 5vw !important;
			// margin-right: 5vw !important;
			width: 85% !important;
		}
	}

	.footer-overlay {
		position: fixed;
		right: 0;
		bottom: 0;
	}
</style>
