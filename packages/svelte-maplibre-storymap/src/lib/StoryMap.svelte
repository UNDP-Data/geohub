<script lang="ts">
	import type { StoryMapConfig, StoryMapTemplate } from '$lib/interfaces/index.js';
	import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import StoryMapChapter from './StoryMapChapter.svelte';
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

	export let config: StoryMapConfig;

	export let template: StoryMapTemplate = 'light';

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

<div bind:this={mapContainer} class="storymap"></div>

<div class="{template} story">
	<div class="header">
		{#if config.title}
			<h3>{config.title}</h3>
		{/if}
		{#if config.logo}
			<img src={config.logo} alt={config.logo} />
		{/if}
		{#if config.subtitle}
			<h4>{config.subtitle}</h4>
		{/if}
		{#if config.byline}
			<p>{config.byline}</p>
		{/if}
	</div>

	{#if $mapStore}
		{#each config.chapters as chapter}
			<StoryMapChapter bind:chapter bind:activeId bind:template />
		{/each}
	{/if}

	<div class="footer">
		{#if config.footer}
			<p>{config.footer}</p>
		{/if}
	</div>
</div>

<style lang="scss">
	// maplibre map container
	.storymap {
		position: fixed;
		top: 0;
		width: 100%;
		height: 100%;
	}

	@import '$lib/css/light/story.scss';
	@import '$lib/css/dark/story.scss';
</style>
