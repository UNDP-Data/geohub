<script lang="ts">
	import type { StoryMapConfig, StoryMapTemplate } from '$lib/interfaces/index.js';
	import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import { setLayerOpacity } from './helpers.js';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		createMapStore,
		createMapStyleStore,
		createStoryMapConfigStore,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore
	} from './stores/index.js';
	import StoryMapChapter from './StoryMapChapter.svelte';
	import StoryMapFooter from './StoryMapFooter.svelte';
	import StoryMapHeader from './StoryMapHeader.svelte';

	export let config: StoryMapConfig;
	export let template: StoryMapTemplate = 'light';
	export let marginTop = 0;

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	$configStore = config;
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let mapContainer: HTMLDivElement;
	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let activeId = '';

	let navigationControl: NavigationControl;

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	onMount(() => {
		const map = new Map({
			container: mapContainer,
			style: config.style,
			hash: false,
			interactive: true,
			dragPan: false,
			dragRotate: false,
			doubleClickZoom: false,
			scrollZoom: false,
			touchZoomRotate: false,
			attributionControl: false
		});

		map.addControl(new AttributionControl({ compact: false }), 'bottom-right');

		if (!navigationControl) {
			navigationControl = new NavigationControl();
		}

		$mapStore = map;

		map.once('load', () => {
			const scroller = scrollama();
			scroller
				.setup({
					step: '.step',
					offset: 0.5,
					progress: true
				})
				.onStepEnter((response) => {
					// if (!activeId) {
					// 	activeId = config.chapters[0].id;
					// }
					// if (activeId !== response.element.id) {
					activeId = response.element.id;
					// }

					const chapter = config.chapters.find((c) => c.id === activeId);
					if (!chapter) return;

					if (navigationControl && $mapStore.hasControl(navigationControl)) {
						$mapStore.removeControl(navigationControl);
					}

					// add/remove Navigation Conrol at the parent since there is a problem of doing at Chapter component
					if (chapter.mapInteractive) {
						const navPosition = chapter.mapNavigationPosition ?? 'top-right';
						$mapStore.addControl(navigationControl, navPosition);
					}
				})
				.onStepExit((response) => {
					if (activeId === response.element.id) {
						activeId = '';

						const chapter = config.chapters.find((chap) => chap.id === response.element.id);
						if (chapter) {
							const eventLength = chapter.onChapterEnter?.length ?? 0;
							if (eventLength > 0) {
								if ($mapStore.loaded()) {
									chapter.onChapterEnter?.forEach((layer) => {
										setLayerOpacity($mapStore, layer);
									});
								} else {
									$mapStore.once('styledata', () => {
										chapter.onChapterEnter?.forEach((layer) => {
											setLayerOpacity($mapStore, layer);
										});
									});
								}
							}
						}
					}
				});
		});
	});
</script>

<div class="storymap-main" style="margin-top: {marginTop}px;">
	<div
		bind:this={mapContainer}
		class="storymap"
		style="top: {marginTop}px;height: calc(100vh - {marginTop}px);"
	></div>

	<div class="story">
		<StoryMapHeader bind:template />

		{#if $mapStore}
			{#each config.chapters as chapter}
				<StoryMapChapter bind:chapter bind:activeId bind:template />
			{/each}
		{/if}

		<StoryMapFooter bind:template />
	</div>
</div>

<style lang="scss">
	.storymap {
		position: fixed;
		width: 100%;
		height: 100%;
	}
</style>
