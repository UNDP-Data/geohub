<script context="module" lang="ts">
	import { Map } from 'maplibre-gl';

	const layerTypes = {
		fill: ['fill-opacity'],
		line: ['line-opacity'],
		circle: ['circle-opacity', 'circle-stroke-opacity'],
		symbol: ['icon-opacity', 'text-opacity'],
		raster: ['raster-opacity'],
		'fill-extrusion': ['fill-extrusion-opacity'],
		heatmap: ['heatmap-opacity']
	};

	const getLayerPaintType = (map: Map, layer: string) => {
		const layerType = map.getLayer(layer)?.type;
		if (!layerType) return undefined;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return layerTypes[layerType];
	};

	export const setLayerOpacity = (map: Map, layer: StoryMapChapterLayerEvent) => {
		const paintProps = getLayerPaintType(map, layer.layer);
		if (!paintProps) return;

		paintProps.forEach(function (prop: string) {
			let options = {};
			if (layer.duration) {
				var transitionProp = prop + '-transition';
				options = { duration: layer.duration };
				map.setPaintProperty(layer.layer, transitionProp, options);
			}
			map.setPaintProperty(layer.layer, prop, layer.opacity, options);
		});
	};
</script>

<script lang="ts">
	import type {
		StoryMapChapter,
		StoryMapChapterLayerEvent,
		StoryMapTemplate
	} from '$lib/interfaces/index.js';
	import { marked } from 'marked';
	import { getContext } from 'svelte';
	import { STORYMAP_MAPSTORE_CONTEXT_KEY, type MapStore } from './stores/map.js';
	import { STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, type MapStyleStore } from './stores/mapStyle.js';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from './stores/storymapConfig.js';

	export let chapter: StoryMapChapter;
	export let activeId = '';
	export let template: StoryMapTemplate = 'light';

	// stores should be set at the parent component
	let mapStore: MapStore = getContext(STORYMAP_MAPSTORE_CONTEXT_KEY);
	let mapStyleStore: MapStyleStore = getContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY);
	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	const setChapterConfig = () => {
		if (chapter.id !== activeId) return;
		if (!$mapStore) return;

		if (chapter.style) {
			if ($mapStyleStore !== chapter.style) {
				$mapStyleStore = chapter.style;
				$mapStore.setStyle(chapter.style);
			}
		} else if ($mapStyleStore !== $config.style) {
			$mapStyleStore = $config.style;
			$mapStore.setStyle($mapStyleStore);
		}

		$mapStore[chapter.mapAnimation || 'flyTo']({
			center: chapter.location.center,
			zoom: chapter.location.zoom,
			bearing: chapter.location.bearing ?? 0,
			pitch: chapter.location.pitch ?? 0
		});

		const eventLength = chapter.onChapterEnter?.length ?? 0;
		if (eventLength > 0) {
			if ($mapStore.loaded()) {
				chapter.onChapterEnter?.forEach((layer) => {
					setLayerOpacity($mapStore, layer);
				});
			} else {
				$mapStore.once('idle', () => {
					chapter.onChapterEnter?.forEach((layer) => {
						setLayerOpacity($mapStore, layer);
					});
				});
			}
		}

		if (chapter.mapInteractive) {
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
			$mapStore.once('moveend', () => {
				const rotateNumber = $mapStore.getBearing();
				$mapStore.rotateTo(rotateNumber + 180, {
					duration: 30000,
					easing: function (t) {
						return t;
					}
				});
			});
		}

		if (chapter.spinGlobe) {
			$mapStore.once('moveend', () => {
				const center = $mapStore.getCenter();
				const newCenter: [number, number] = [center.lng + 360, center.lat];
				$mapStore.easeTo({ center: newCenter, duration: 20000, easing: (n) => n });
			});
		}
	};

	$: activeId, setChapterConfig();
</script>

<section
	id={chapter.id}
	class="{template} step {activeId === chapter.id ? 'active' : ''} {chapter.alignment ??
		'center'} {chapter.hidden ? 'hidden' : ''}"
	style={chapter.mapInteractive ? 'pointer-events:none;' : ''}
>
	{#if chapter.title}
		<h3>{chapter.title}</h3>
	{/if}

	{#if chapter.image && (!chapter.imageAlignment || chapter.imageAlignment === 'center')}
		<div class="chapter-image {chapter.imageAlignment ?? 'center'}">
			<img src={chapter.image} alt="{chapter.title} image" />
		</div>
	{/if}

	<div class="chapter-contents">
		{#if chapter.image && chapter.imageAlignment === 'left'}
			<div class="chapter-image {chapter.imageAlignment}">
				<img src={chapter.image} alt="{chapter.title} image" />
			</div>
		{/if}
		{#if chapter.description}
			<div class="chapter-markdown">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html marked.parse(chapter.description)}
			</div>
		{/if}
		{#if chapter.image && chapter.imageAlignment === 'right'}
			<div class="chapter-image {chapter.imageAlignment}">
				<img src={chapter.image} alt="{chapter.title} image" />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@import '$lib/css/light/chapter.scss';
	@import '$lib/css/dark/chapter.scss';
</style>
