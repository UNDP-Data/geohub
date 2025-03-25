<script lang="ts">
	import type { StoryMapConfig, StoryMapTemplate } from '$lib/interfaces';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import {
		addProtocol,
		AttributionControl,
		Map,
		NavigationControl,
		type ControlPosition,
		type StyleSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import { setLayerOpacity } from './helpers';
	import MaplibreLegendControl from './MaplibreLegendControl.svelte';
	import {
		createMapStore,
		createMapStyleStore,
		createStoryMapConfigStore,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore
	} from './stores';
	import StoryMapChapter from './StoryMapChapter.svelte';
	import StoryMapFooter from './StoryMapFooter.svelte';
	import StoryMapHeader from './StoryMapHeader.svelte';

	interface Props {
		config: StoryMapConfig;
		template?: StoryMapTemplate;
		marginTop?: number;
		compactAttribution?: boolean;
		footer?: import('svelte').Snippet;
	}

	let {
		config = $bindable(),
		template = $bindable('light'),
		marginTop = $bindable(0),
		compactAttribution = $bindable(true),
		footer = $bindable()
	}: Props = $props();

	const tippyTooltip = initTooltipTippy({
		placement: 'left',
		arrow: false
	});

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	$configStore = config;
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let mapContainer: HTMLDivElement | undefined = $state();
	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let activeId = $state('');
	let activeStyleId = $state('');
	let activeStyleOrigin = $state('');
	let legendPosition: ControlPosition = $state('bottom-left');
	let showLegend = $state(false);

	let navigationControl: NavigationControl;

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	let slideIndex = $state(0);
	let scrollY = $state(0);
	let innerWidth = $state(0);
	let slideProgressHeight = $state(0);

	// collapse legend for small screen device
	let isLegendExpanded = $state(false);
	$effect(() => {
		isLegendExpanded = innerWidth < 768 ? false : true;
	});

	onMount(async () => {
		let protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);

		if (!mapContainer) return;
		const styleInfo = getStyleInfo(config.style);
		if (styleInfo) {
			activeStyleId = styleInfo.id;
			activeStyleOrigin = styleInfo.origin;
		} else {
			activeStyleId = '';
			activeStyleOrigin = '';
		}

		let mapStyle: StyleSpecification;
		if (typeof config.style === 'string') {
			const res = await fetch(config.style);
			mapStyle = await res.json();
		} else [(mapStyle = config.style)];

		if (config.location.center && config.location.center[0] !== null) {
			// if center is not undefined, use location from config
			mapStyle.bearing = config.location.bearing;
			mapStyle.pitch = config.location.pitch;
			mapStyle.center = config.location.center;
			mapStyle.zoom = config.location.zoom;
		}

		const center = mapStyle.center ?? [0, 0];
		const zoom = mapStyle.zoom ?? 0;
		const bearing = mapStyle.bearing ?? 0;
		const pitch = mapStyle.pitch ?? 0;

		const map = new Map({
			container: mapContainer,
			style: mapStyle,
			center: [center[0], center[1]],
			zoom,
			bearing,
			pitch,
			maxPitch: 85,
			hash: false,
			interactive: true,
			dragPan: false,
			dragRotate: false,
			doubleClickZoom: false,
			scrollZoom: false,
			touchZoomRotate: false,
			attributionControl: false
		});

		map.addControl(new AttributionControl({ compact: compactAttribution }), 'bottom-right');

		if (!navigationControl) {
			navigationControl = new NavigationControl();
		}

		$mapStore = map;

		map.once('load', () => {
			map.resize();
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

					map.resize();

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
						if (config.chapters[config.chapters.length - 1].id !== response.element.id) {
							activeId = '';
						}

						map.resize();

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
		const pattern = /(^https?:\/\/[^\/]+)\/api\/style\/([^\/]+)\.json/;
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
			showLegend = false;
			handleScrollToIndex(slideIndex);
		}
	};

	const handleScrollToIndex = debounce(async (index: number) => {
		if (!$mapStore) return;
		slideIndex = index;
		if (index === 0) {
			scrollTo('header');

			let style: StyleSpecification;
			if (typeof $configStore.style === 'string') {
				const res = await fetch($configStore.style);
				style = await res.json();
			} else {
				style = $configStore.style;
			}

			const isCustomisedLocationAvailable =
				$configStore.location.center && $configStore.location.center[0] !== null;

			const center = isCustomisedLocationAvailable
				? $configStore.location.center
				: ((style.center as [number, number]) ?? [0, 0]);
			const zoom = isCustomisedLocationAvailable ? $configStore.location.zoom : (style.zoom ?? 0);
			const bearing = isCustomisedLocationAvailable
				? ($configStore.location.bearing ?? 0)
				: (style.bearing ?? 0);
			const pitch = isCustomisedLocationAvailable
				? ($configStore.location.pitch ?? 0)
				: (style.pitch ?? 0);

			$mapStore.setBearing(bearing);
			$mapStore.setPitch(pitch);
			$mapStore.flyTo({ center: center, zoom: zoom });
			$mapStore.setStyle(style);
		} else {
			const chapter = $configStore.chapters[index - 1];
			scrollTo(chapter.id);
		}
	}, 300);
</script>

<svelte:window bind:innerWidth bind:scrollY onscrollend={handleOnScrollEnd} />

<div class="storymap-main" style="margin-top: {marginTop}px; ">
	<div class="story">
		<StoryMapHeader bind:template />

		{#if $mapStore}
			{#each config.chapters as chapter (chapter.id)}
				<StoryMapChapter {chapter} bind:activeId bind:template />
			{/each}
		{/if}
	</div>

	<div
		bind:this={mapContainer}
		class="storymap"
		style="top: {marginTop}; height: calc(100vh - {marginTop}px);"
	>
		{#if $mapStore && activeStyleId && activeStyleOrigin && showLegend}
			{#key activeId}
				{#key legendPosition}
					<MaplibreLegendControl
						bind:map={$mapStore}
						bind:styleId={activeStyleId}
						bind:origin={activeStyleOrigin}
						bind:position={legendPosition}
						bind:isExpanded={isLegendExpanded}
						showInvisibleLayers={false}
						showInteractive={false}
					/>
				{/key}
			{/key}
		{/if}

		{#if config.showProgress !== false}
			<div
				class="slide-progress is-flex is-justify-content-center is-align-items-center"
				bind:clientHeight={slideProgressHeight}
			>
				<div
					class="progress-container is-flex is-flex-direction-column is-align-content-space-evenly p-2"
				>
					{#key slideIndex}
						<button
							class="progress-button {slideIndex === 0 ? 'is-active' : ''}"
							use:tippyTooltip={{ content: config.title }}
							onclick={() => {
								handleScrollToIndex(0);
							}}
							aria-label={config.title}
						>
						</button>
						{#each config.chapters as ch, index (ch.id)}
							<button
								class="progress-button {slideIndex === index + 1 ? 'is-active' : ''}"
								use:tippyTooltip={{ content: ch.title }}
								onclick={() => {
									handleScrollToIndex(index + 1);
								}}
								aria-label={ch.title}
							>
							</button>
						{/each}
					{/key}
				</div>
			</div>
		{/if}
	</div>

	{#if config.footer}
		<StoryMapFooter bind:template />
	{/if}

	{@render footer?.()}
</div>

<style lang="scss">
	.storymap-main {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		.story {
			position: relative;
			z-index: 1;
			pointer-events: none;
		}

		.storymap {
			position: sticky;
			top: 0;
			bottom: 0;
			width: 100%;
			height: 100%;

			.slide-progress {
				position: absolute;
				right: 21px;
				top: 50%;
				transform: translateY(-50%);
				-webkit-transform: translateY(-50%);
				-ms-transform: translateY(-50%);

				z-index: 10;

				display: none !important;

				@media (min-width: 48em) {
					display: block !important;
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

		/** make default scroll bar hidden */
		::-webkit-scrollbar {
			display: none;
		}
	}
</style>
