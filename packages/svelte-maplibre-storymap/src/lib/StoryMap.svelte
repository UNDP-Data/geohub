<script lang="ts">
	import type { StoryMapConfig, StoryMapTemplate } from '$lib/interfaces/index.js';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import { debounce } from 'lodash-es';
	import {
		AttributionControl,
		Map,
		NavigationControl,
		type ControlPosition,
		type StyleSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import { setLayerOpacity } from './helpers.js';
	import MaplibreLegendControl from './MaplibreLegendControl.svelte';
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

	const tippyTooltip = initTooltipTippy({
		placement: 'left',
		arrow: false
	});

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	$configStore = config;
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let mapContainer: HTMLDivElement;
	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let activeId = '';
	let activeStyleId = '';
	let activeStyleOrigin = '';
	let legendPosition: ControlPosition = 'bottom-left';
	let showLegend = true;

	let navigationControl: NavigationControl;

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	let slideIndex = 0;
	let scrollY = 0;
	let scrollBeyondFooter = false;
	let innerWidth = 0;

	// collapse legend for small screen device
	$: isLegendExpanded = innerWidth < 768 ? false : true;

	let sky: SkyControl;

	onMount(() => {
		const styleInfo = getStyleInfo(config.style);
		if (styleInfo) {
			activeStyleId = styleInfo.id;
			activeStyleOrigin = styleInfo.origin;
		} else {
			activeStyleId = '';
			activeStyleOrigin = '';
		}

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
			if (!sky) {
				sky = new SkyControl();
			}
			sky.addTo(map, { timeType: 'solarNoon' });

			const scroller = scrollama();
			scroller
				.setup({
					step: '.step',
					offset: 0.5,
					progress: true
				})
				.onStepEnter((response) => {
					const index = response.index;
					slideIndex = index + 1;
					activeId = response.element.id;

					const chapter = config.chapters.find((c) => c.id === activeId);
					if (!chapter) return;
					legendPosition = chapter.legendPosition ?? 'bottom-left';
					showLegend = chapter.showLegend === false ? false : true;

					if (chapter.style) {
						const styleInfo = getStyleInfo(chapter.style);
						if (styleInfo) {
							activeStyleId = styleInfo.id;
							activeStyleOrigin = styleInfo.origin;
						}
					} else {
						activeStyleId = '';
						activeStyleOrigin = '';
					}

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

	const getStyleInfo = (style: StyleSpecification | string) => {
		if (typeof style !== 'string') return;
		/* eslint-disable-next-line */
		const pattern = /(^https?:\/\/[^\/]+)\/api\/style\/([^\/]+)\.json$/;
		const match = style.match(pattern);

		if (match) {
			const origin = match[1];
			const id = match[2];
			return { origin, id };
		} else {
			return null;
		}
	};

	const scrollTo = (id: string) => {
		var ele = document.getElementById(id);
		if (!ele) return;
		window.scrollTo(ele.offsetLeft, ele.offsetTop);
	};

	const handleOnScrollEnd = () => {
		if (scrollY === 0) {
			slideIndex = 0;
		} else {
			const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
			const lastChapterElement = document.getElementById(lastChapter.id);
			if (!lastChapterElement) return;
			if (scrollY > lastChapterElement.offsetTop) {
				slideIndex = $configStore.chapters.length + 1;
			}
		}
		const footerEle = document.getElementById('footer');
		if (!footerEle) return;
		scrollBeyondFooter = scrollY > footerEle.offsetTop;
	};

	const handleScrollToIndex = debounce(async (index: number) => {
		if (index === 0) {
			scrollTo('header');

			let style: StyleSpecification;
			if (typeof $configStore.style === 'string') {
				const res = await fetch($configStore.style);
				style = await res.json();
			} else {
				style = $configStore.style;
			}
			const center = (style.center as [number, number]) ?? [0, 0];
			const zoom = style.zoom ?? 0;
			const bearing = style.bearing ?? 0;
			const pitch = style.pitch ?? 0;
			$mapStore.setBearing(bearing);
			$mapStore.setPitch(pitch);
			$mapStore.flyTo({ center: center, zoom: zoom });
			$mapStore.setStyle(style);
		} else if (index === $configStore.chapters.length + 1) {
			scrollTo('footer');
		} else {
			const chapter = $configStore.chapters[index - 1];
			scrollTo(chapter.id);
		}
	}, 300);
</script>

<svelte:window bind:innerWidth bind:scrollY on:scrollend={handleOnScrollEnd} />

<div class="storymap-main" style="margin-top: {marginTop}px;">
	{#if config.showProgress !== false}
		<div
			class="slide-progress {scrollBeyondFooter
				? 'hidden'
				: ''} is-flex is-justify-content-center is-align-items-center"
		>
			<div
				class="progress-container is-flex is-flex-direction-column is-align-content-space-evenly p-2"
			>
				<button
					class="progress-button {slideIndex === 0 ? 'is-active' : ''}"
					use:tippyTooltip={{ content: config.title }}
					on:click={() => {
						handleScrollToIndex(0);
					}}
				>
				</button>
				{#each config.chapters as ch, index}
					<button
						class="progress-button {activeId === ch.id ? 'is-active' : ''}"
						use:tippyTooltip={{ content: ch.title }}
						on:click={() => {
							handleScrollToIndex(index + 1);
						}}
					>
					</button>
				{/each}
				<button
					class="progress-button {!activeId && slideIndex === config.chapters.length + 1
						? 'is-active'
						: ''}"
					use:tippyTooltip={{ content: config.footer }}
					on:click={() => {
						handleScrollToIndex(config.chapters.length + 1);
					}}
				>
				</button>
			</div>
		</div>
	{/if}

	<div
		bind:this={mapContainer}
		class="storymap"
		style="top: {marginTop}px;height: calc(100vh - {marginTop}px);"
	></div>

	{#if $mapStore && activeStyleId && activeStyleOrigin && showLegend}
		{#key activeId}
			{#key legendPosition}
				<MaplibreLegendControl
					bind:map={$mapStore}
					bind:styleId={activeStyleId}
					bind:origin={activeStyleOrigin}
					bind:position={legendPosition}
					bind:isExpanded={isLegendExpanded}
				/>
			{/key}
		{/key}
	{/if}

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
	.storymap-main {
		position: relative;

		.storymap {
			position: fixed;
			width: 100%;
			height: 100%;
		}

		/** make default scroll bar hidden */
		::-webkit-scrollbar {
			display: none;
		}

		.slide-progress {
			position: fixed;
			right: 21px;
			top: 50%;
			transform: translateY(-50%);
			-webkit-transform: translateY(-50%);
			-ms-transform: translateY(-50%);

			z-index: 10;

			display: none !important;

			@media (min-width: 48em) {
				display: block !important;

				&.hidden {
					display: none !important;
				}
			}

			.progress-container {
				height: fit-content;
				max-height: 70%;
				overflow-y: auto;
				gap: 24px;
				border-radius: 100px;
				background: rgba(255, 255, 255, 0.7);

				.progress-button {
					width: 8px;
					height: 8px;
					border-radius: 23px;
					border: 1px solid #55606e;

					&.is-active {
						border: 2px solid #55606e;
						background: #55606e;
					}
				}
			}
		}
	}
</style>
