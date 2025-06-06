<script lang="ts">
	import type {
		mapProjectionType,
		StoryMapChapterType,
		StoryMapConfig,
		StoryMapTemplate
	} from '$lib/interfaces';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import {
		addProtocol,
		AttributionControl,
		Map,
		NavigationControl,
		type ControlPosition,
		type ProjectionSpecification,
		type StyleSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
	import scrollama from 'scrollama';
	import { onMount, setContext } from 'svelte';
	import { layerTypes, setLayerOpacity } from './helpers';
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
	let activeChapter: StoryMapChapterType | undefined = $state();

	let navigationControl: NavigationControl;

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	let slideIndex = $state(0);
	let scrollY = $state(0);
	let innerWidth = $state(0);
	let slideProgressHeight = $state(0);

	// collapse legend for small screen device
	let isLegendExpanded = $derived(innerWidth < 768 ? false : true);

	const spinGlobe = () => {
		const center = $mapStore.getCenter();

		const zoom = $mapStore.getZoom();
		const baseDelta = 5;
		const adjustedDelta = baseDelta / Math.pow(2, zoom - 1);
		const newCenter: [number, number] = [center.lng + adjustedDelta, center.lat];

		let rotateNumber = $mapStore.getBearing();
		if (activeChapter && activeChapter.rotateAnimation) {
			rotateNumber = rotateNumber + 1;
		}

		$mapStore.easeTo(
			{ center: newCenter, bearing: rotateNumber, duration: 100, easing: (n) => n },
			'moveend'
		);
		$mapStore.once('moveend', spinGlobe);
	};

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

		let mapProjection: mapProjectionType;
		if (config.projection) {
			mapProjection = config.projection;
		} else if (mapStyle.projection) {
			mapProjection = mapStyle.projection.type as mapProjectionType;
		} else {
			mapProjection = 'mercator';
		}
		if (mapProjection) {
			mapStyle.projection = { type: mapProjection };
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
					activeChapter = chapter;

					if (navigationControl && $mapStore.hasControl(navigationControl)) {
						$mapStore.removeControl(navigationControl);
					}

					// add/remove Navigation Conrol at the parent since there is a problem of doing at Chapter component
					if (chapter.mapInteractive) {
						const navPosition = chapter.mapNavigationPosition ?? 'top-right';
						$mapStore.addControl(navigationControl, navPosition);
					}

					setChapterConfig(chapter);
				})
				.onStepExit((response) => {
					if (activeId === response.element.id) {
						if (config.chapters[config.chapters.length - 1].id !== response.element.id) {
							activeId = '';
							activeChapter = undefined;
							$mapStore.off('moveend', spinGlobe);
						}

						map.resize();

						const chapter = config.chapters.find((chap) => chap.id === response.element.id);
						if (chapter) {
							$mapStore.off('moveend', spinGlobe);
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

	const setChapterConfig = async (chapter: StoryMapChapterType) => {
		if (!$mapStore) return;
		if (!chapter) return;

		if (chapter.id !== activeId) return;
		if (chapter.style) {
			if ($currentStyle !== chapter.style) {
				$currentStyle = chapter.style;
			}
		} else if ($currentStyle !== config.style) {
			$currentStyle = config.style;
		}

		if (typeof $currentStyle === 'string') {
			const res = await fetch($currentStyle);
			$currentStyle = await res.json();
		}

		const eventLength = chapter.onChapterEnter?.length ?? 0;
		if (eventLength > 0) {
			const newStyle: StyleSpecification = JSON.parse(JSON.stringify($currentStyle));
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
			$currentStyle = newStyle;
		}

		let mapProjection: mapProjectionType;
		if (chapter.projection) {
			mapProjection = chapter.projection;
		} else if (config.projection) {
			mapProjection = config.projection;
		} else {
			mapProjection = 'mercator';
		}
		if (
			!(mapProjection && ($currentStyle as StyleSpecification).projection?.type === mapProjection)
		) {
			($currentStyle as StyleSpecification).projection = { type: mapProjection };
		}

		if ($mapStore.isMoving()) {
			$mapStore.stop();
		}

		$mapStore.setStyle($currentStyle);

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

		if (chapter.spinGlobe) {
			if ($mapStore.loaded()) {
				spinGlobe();
			} else {
				$mapStore.once('idle', spinGlobe);
			}
		}
		if (!chapter.spinGlobe && chapter.rotateAnimation) {
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
	};

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

			if ($mapStore.isMoving()) {
				$mapStore.stop();
			}

			$mapStore.flyTo({ center: center, zoom: zoom, bearing: bearing, pitch: pitch });

			let mapProjection: ProjectionSpecification;
			if (style.projection) {
				mapProjection = style.projection;
			} else if (config.projection) {
				mapProjection = { type: config.projection };
			} else {
				mapProjection = { type: 'mercator' };
			}
			if (mapProjection) {
				style.projection = mapProjection;
			}

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
			background: linear-gradient(to right, #4286f4, #373b44);

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
