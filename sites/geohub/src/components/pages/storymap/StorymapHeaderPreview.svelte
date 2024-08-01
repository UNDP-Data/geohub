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
	import { Notification } from '@undp-data/svelte-undp-components';
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

		template_id = ($configStore as StoryMapConfig).template_id;
	}, 300);
</script>

<div class="map" style="width: {width}; height: {height};" bind:this={mapContainer}>
	{#if !($configStore?.title?.length > 0 && $configStore.style)}
		<div class="warning-panel">
			<Notification type="danger" showCloseButton={false}>
				<div class="content">
					<p>To start editing your story, please do the following thing for your title slide.</p>

					<ul>
						{#if !($configStore?.title?.length > 0)}
							<li>Set title of the story from Card tab</li>
						{/if}

						{#if !$configStore.style}
							<li>Select a base map style of the story from Map tab</li>
						{/if}
					</ul>
				</div>
			</Notification>
		</div>
	{/if}
</div>
<div class="overlay" style="width: {width}; height: {height};">
	<StoryMapHeader bind:template={template_id} />
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;

		.warning-panel {
			position: absolute;
			top: 24px;
			left: 24px;
		}
	}

	.overlay {
		padding-top: 20vh;

		:global(.header) {
			margin-top: auto !important;
			margin-bottom: auto !important;
			max-width: 80% !important;
		}
	}
</style>
