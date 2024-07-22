<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapChapter as StoryMapChapterType, StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		setLayerOpacity,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		StoryMapChapter,
		type MapStore,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map } from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';

	export let chapter: StoryMapChapterType;
	export let width = '100%';
	export let height = '100%';

	let mapContainer: HTMLDivElement;

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate;

	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	onMount(() => {
		$mapStore = new Map({
			container: mapContainer,
			style: chapter.style,
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

	$: chapter, updateMapStyle();
	const updateMapStyle = debounce(() => {
		if (!$mapStore) return;
		if (!chapter) return;

		$mapStore.setBearing(chapter.location.bearing);
		$mapStore.setPitch(chapter.location.pitch);
		$mapStore.flyTo({ zoom: chapter.location.zoom, center: chapter.location.center });
		$mapStore.setStyle(chapter.style);
		$mapStore.once('styledata', () => {
			chapter.onChapterEnter?.forEach((layer) => {
				setLayerOpacity($mapStore, layer);
			});
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
		// width: 100%;
		border: 1px solid #d4d6d8;
		border-top: none;
	}

	.overlay {
		padding-top: 20vh;

		// :global(.step) {
		:global(.center) {
			width: 50% !important;
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
