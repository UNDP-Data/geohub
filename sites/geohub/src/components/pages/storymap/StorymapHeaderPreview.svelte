<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		createMapStyleStore,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
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
			sky.addTo($mapStore, { timeType: 'solarNoon' });
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

		return mapStyle;
	};

	const updateMapStyle = debounce(async () => {
		if (!$mapStore) return;
		if (!mapStyle) return;

		const newStyle = await applyLayerEvent();
		$mapStore.setStyle(newStyle);

		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
	}, 300);
</script>

<div class="map" style="width: {width}; height: {height};" bind:this={mapContainer}></div>
<div class="overlay is-flex is-align-items-center" style="width: {width}; height: {height};">
	<StoryMapHeader bind:template={template_id} />
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;
	}
</style>
