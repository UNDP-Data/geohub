<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		createMapStyleStore,
		layerTypes,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		StoryMapFooter,
		StoryMapHeader,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map, type StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';

	export let width = '100%';
	export let height = '100%';
	export let isHeader = true;

	let mapContainer: HTMLDivElement;

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate;

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
			sky.addTo($mapStore);
		});

		configStore.subscribe(updateMapStyle);
	});

	const applyLayerEvent = async () => {
		if (!mapStyle) {
			if (typeof $configStore.style === 'string') {
				const res = await fetch($configStore.style);
				mapStyle = await res.json();
			} else {
				mapStyle = $configStore.style;
			}
		}

		if (!isHeader && $configStore.chapters?.length > 0) {
			const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
			const res = await fetch(lastChapter.style as string);
			const chapterStyle: StyleSpecification = await res.json();

			lastChapter.onChapterEnter?.forEach((layer) => {
				const index = chapterStyle.layers.findIndex((l) => l.id === layer.layer);
				if (index === -1) return;
				const l = chapterStyle.layers[index];
				const props = layerTypes[l.type];
				if (!(props && props.length > 0)) return;
				props.forEach((prop) => {
					chapterStyle.layers[index].paint[prop] = layer.opacity;
				});
				mapStyle = chapterStyle;
			});
		}

		return mapStyle;
	};

	const updateMapStyle = debounce(async () => {
		if (!$mapStore) return;
		if (!mapStyle) return;

		if (!isHeader && $configStore.chapters?.length > 0) {
			const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
			$mapStore.setBearing(lastChapter.location.bearing);
			$mapStore.setPitch(lastChapter.location.pitch);

			const location = { zoom: lastChapter.location.zoom, center: lastChapter.location.center };
			if (lastChapter.mapAnimation === 'easeTo') {
				$mapStore.easeTo(location);
			} else if (lastChapter.mapAnimation === 'jumpTo') {
				$mapStore.jumpTo(location);
			} else {
				$mapStore.flyTo(location);
			}
		}

		const newStyle = await applyLayerEvent();
		$mapStore.setStyle(newStyle);

		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
	}, 300);
</script>

<div class="map" style="width: {width}; height: {height};" bind:this={mapContainer}></div>
<div
	class="overlay {isHeader ? 'is-flex is-align-items-center' : 'is-flex is-align-items-end'}"
	style="width: {width}; height: {height};"
>
	{#if isHeader}
		<StoryMapHeader bind:template={template_id} />
	{:else}
		<StoryMapFooter bind:template={template_id} />
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;
	}
</style>
