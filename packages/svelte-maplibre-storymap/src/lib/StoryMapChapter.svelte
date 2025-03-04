<script lang="ts">
	import type { StoryMapChapterType, StoryMapTemplate } from '$lib/interfaces';
	import type { StyleSpecification } from 'maplibre-gl';
	import { marked } from 'marked';
	import { getContext, untrack } from 'svelte';
	import { layerTypes } from './helpers';
	import { STORYMAP_MAPSTORE_CONTEXT_KEY, type MapStore } from './stores/map';
	import { STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, type MapStyleStore } from './stores/mapStyle';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from './stores/storymapConfig';

	interface Props {
		chapter: StoryMapChapterType;
		activeId?: string;
		template?: StoryMapTemplate;
		size?: 'small' | 'normal';
	}

	let {
		chapter = $bindable(),
		activeId = $bindable(''),
		template = $bindable('light'),
		size = $bindable('normal')
	}: Props = $props();

	// stores should be set at the parent component
	let mapStore: MapStore = getContext(STORYMAP_MAPSTORE_CONTEXT_KEY);
	let mapStyleStore: MapStyleStore = getContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY);
	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	let isLast = $derived($config.chapters[$config.chapters.length - 1]?.id === chapter.id);

	const setChapterConfig = async () => {
		if (!$mapStore) return;
		if (!chapter) return;

		if (chapter.id !== activeId) return;
		if (chapter.style) {
			if ($mapStyleStore !== chapter.style) {
				$mapStyleStore = chapter.style;
			}
		} else if ($mapStyleStore !== $config.style) {
			$mapStyleStore = $config.style;
		}

		if (typeof $mapStyleStore === 'string') {
			const res = await fetch($mapStyleStore);
			$mapStyleStore = await res.json();
		}

		const eventLength = chapter.onChapterEnter?.length ?? 0;
		if (eventLength > 0) {
			const newStyle: StyleSpecification = JSON.parse(JSON.stringify($mapStyleStore));
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
					if (!newStyle.layers[index].layout) {
						newStyle.layers[index].layout = {};
					}
					newStyle.layers[index].layout.visibility = visibility;
				}
			});
			$mapStyleStore = newStyle;
		}

		$mapStore.setStyle($mapStyleStore);

		$mapStore[chapter.mapAnimation || 'flyTo']({
			center: chapter.location.center,
			zoom: chapter.location.zoom,
			bearing: chapter.location.bearing ?? 0,
			pitch: chapter.location.pitch ?? 0
		});

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

	$effect(() => {
		if (activeId !== undefined) {
			untrack(() => {
				setChapterConfig();
			});
		}
	});
</script>

<section
	id={chapter.id}
	class="{template} step {chapter.alignment ?? 'center'} {chapter.hidden
		? 'hidden'
		: ''} {size} {isLast ? 'last' : ''}"
>
	<div
		class="card-content {activeId === chapter.id ? 'active' : ''}  {size}"
		style="{chapter.mapInteractive ? 'pointer-events:none;' : ''} {chapter?.cardHidden === true
			? 'visibility: hidden;'
			: ''} "
	>
		{#if chapter.title}
			<h6 class={size}>{chapter.title}</h6>
		{/if}

		<div class="chapter-contents {size}">
			{#if chapter.description}
				<div class="markdown-content content">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked.parse(chapter.description)}
				</div>
			{/if}
		</div>
		{#if chapter.image}
			<div class="chapter-image {size}">
				<img src={chapter.image} alt="{chapter.title} image" />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@import './css/light/chapter.scss';
	@import './css/dark/chapter.scss';
</style>
