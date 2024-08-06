<script lang="ts">
	import type { StoryMapConfig, StoryMapTemplate } from '$lib/interfaces/index.js';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
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

	let slideIndex = [0];
	let scrollY = 0;

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
					const index = response.index;
					slideIndex = [index + 1];
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

	const formatter = (value: number) => {
		if (value === 0) {
			return 'Header';
		} else if (value === $configStore.chapters.length + 1) {
			return 'Footer';
		} else {
			const chapter = $configStore.chapters[value - 1];
			return `Chapter ${value} \n ${chapter.title}`;
		}
	};

	const handleChapterSlideChanged = debounce((e: { detail: { value: number } }) => {
		const value = e.detail.value;
		if (value === 0) {
			scrollTo('header');
		} else if (value === $configStore.chapters.length + 1) {
			scrollTo('footer');
		} else {
			const chapter = $configStore.chapters[value - 1];
			scrollTo(chapter.id);
		}
	}, 300);

	const scrollTo = (id: string) => {
		var ele = document.getElementById(id);
		if (!ele) return;
		window.scrollTo(ele.offsetLeft, ele.offsetTop);
	};

	$: scrollY, handleScrollChanged();
	const handleScrollChanged = () => {
		if (scrollY === 0) {
			slideIndex = [0];
		} else {
			const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
			const lastChapterElement = document.getElementById(lastChapter.id);
			if (!lastChapterElement) return;
			if (scrollY > lastChapterElement.offsetTop) {
				slideIndex = [$configStore.chapters.length + 1];
			}
		}
	};
</script>

<svelte:window bind:scrollY />

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

		<div
			class="slide-progress"
			style="top: {marginTop + 100}px;height: calc(75vh - {marginTop}px);"
		>
			<div class="range-slider">
				<RangeSlider
					min={0}
					max={config.chapters.length + 1}
					bind:values={slideIndex}
					vertical
					reversed
					float
					pips
					all="pips"
					range="min"
					hoverable
					{formatter}
					handleFormatter={formatter}
					on:change={handleChapterSlideChanged}
				/>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.storymap {
		position: fixed;
		width: 100%;
		height: 100%;
	}

	.story {
		position: relative;
		-ms-overflow-style: none;
		scrollbar-width: none;
		::-webkit-scrollbar {
			display: none;
		}

		.slide-progress {
			position: fixed;
			right: 0px;
			z-index: 999;
			background-color: rgba(255, 255, 255, 0.5);

			.range-slider {
				--range-slider: #edeff0; /* slider main background color */
				--range-handle-inactive: #6babeb; /* inactive handle color */
				--range-handle: #6babeb; /* non-focussed handle color */
				--range-handle-focus: #1f5a95; /* focussed handle color */
				--range-handle-border: var(--range-handle); /* handle border color */
				--range-range-inactive: var(
					--range-handle-inactive
				); /* inactive range bar background color */
				--range-range: var(--range-handle-focus); /* active range background color */
				--range-float-inactive: var(
					--range-handle-inactive
				); /* inactive floating label background color */
				--range-float: var(--range-handle-focus); /* floating label background color */
				--range-float-text: white; /* text color on floating label */

				--range-pip: #a9b1b7; /* color of the base pips */
				--range-pip-text: var(--range-pip); /* color of the base labels */
				--range-pip-active: #232e3d; /* active pips (when handle is on a slider-stop) */
				--range-pip-active-text: var(
					--range-pip-active
				); /* active labels (when handle is on a slider-stop) */
				--range-pip-hover: #232e3d; /* when a slider-stop is hovered */
				--range-pip-hover-text: var(--range-pip-hover); /* when a slider-stop is hovered */

				margin: 0;
				font-size: 16px;
				height: 100%;

				:global(.rangeSlider) {
					height: 95%;
				}

				:global(.rangeFloat) {
					transform: translate(-110%, 0%);
					z-index: 100;
					text-wrap: balance;
					width: 150px;
				}
			}
		}
	}
</style>
