<script lang="ts">
	import type { StoryMapChapter, StoryMapTemplate } from '$lib/interfaces/index.js';
	import { marked } from 'marked';
	import { getContext } from 'svelte';
	import { setLayerOpacity } from './helpers.js';
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
		if (!$mapStore) return;
		if (!chapter) return;
		if (chapter.id !== activeId) return;
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

	<div class="chapter-contents">
		{#if chapter.description}
			<div class="chapter-markdown">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html marked.parse(chapter.description)}
			</div>
		{/if}
	</div>
	{#if chapter.image}
		<div class="chapter-image">
			<img src={chapter.image} alt="{chapter.title} image" />
		</div>
	{/if}
</section>

<style lang="scss">
	@import '$lib/css/light/chapter.scss';
	@import '$lib/css/dark/chapter.scss';
</style>
