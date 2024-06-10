<script lang="ts">
	import type { StoryMapConfig } from '$lib/interfaces/index.js';
	import { Map, NavigationControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import StoryMapChapter from './StoryMapChapter.svelte';
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

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	$configStore = config;
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let mapContainer: HTMLDivElement;
	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let activeId: string = config.chapters[0].id;

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
			touchZoomRotate: false
		});

		if (!navigationControl) {
			navigationControl = new NavigationControl();
		}

		$mapStore = map;

		const scroller = scrollama();
		scroller
			.setup({
				step: '.step',
				offset: 0.5,
				progress: true
			})
			.onStepEnter((response) => {
				activeId = response.element.id;

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
				}
			});
	});
</script>

<div bind:this={mapContainer} class="storymap"></div>
<div class="story">
	<div class="header">
		{#if config.title}
			<h1>{config.title}</h1>
		{/if}
		{#if config.logo}
			<img src={config.logo} alt={config.logo} />
		{/if}
		{#if config.subtitle}
			<h2>{config.subtitle}</h2>
		{/if}
		{#if config.byline}
			<p>{config.byline}</p>
		{/if}
	</div>

	{#each config.chapters as chapter}
		<StoryMapChapter bind:chapter bind:activeId />
	{/each}

	<div class="footer">
		{#if config.footer}
			<p>{config.footer}</p>
		{/if}
	</div>
</div>
