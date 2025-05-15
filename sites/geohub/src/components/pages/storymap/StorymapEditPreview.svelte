<script lang="ts">
	import { attribution } from '$lib/config/AppConfig';
	import type { StoryMapChapter as StoryMapChapterType, StoryMapConfig } from '$lib/types';
	import {
		createMapStore,
		createMapStyleStore,
		layerTypes,
		MaplibreLegendControl,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		STORYMAP_MAPSTORE_CONTEXT_KEY,
		STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY,
		StoryMapChapter,
		StoryMapHeader,
		type mapProjectionType,
		type MapStore,
		type MapStyleStore,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { debounce } from 'lodash-es';
	import { AttributionControl, Map, NavigationControl, type StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount, setContext, untrack } from 'svelte';

	interface Props {
		chapter?: StoryMapChapterType | undefined;
		width?: string;
		height?: number;
	}

	let {
		chapter = $bindable(undefined),
		width = $bindable('100%'),
		height = $bindable(0)
	}: Props = $props();

	let mapContainer: HTMLDivElement | undefined = $state();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate = $state('light');
	let footerHeight = $state(0);

	let navigationControl: NavigationControl;

	let mapStore: MapStore = createMapStore();
	setContext(STORYMAP_MAPSTORE_CONTEXT_KEY, mapStore);

	let currentStyle: MapStyleStore = createMapStyleStore();
	setContext(STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY, currentStyle);

	let mapStyle: StyleSpecification;

	onMount(async () => {
		if (!mapContainer) return;
		const newStyle = await applyLayerEvent();

		$mapStore = new Map({
			container: mapContainer,
			style: newStyle,
			maxPitch: 85,
			interactive: false,
			attributionControl: false
		});
		$mapStore.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		updateMapStyle();

		configStore.subscribe(updateMapStyle);
	});

	const applyLayerEvent = async () => {
		if (chapter) {
			if (!mapStyle) {
				if (typeof chapter.style === 'string') {
					const res = await fetch(chapter.style);
					mapStyle = await res.json();
				} else {
					mapStyle = chapter.style;
				}
			}

			const newStyle: StyleSpecification = JSON.parse(JSON.stringify(mapStyle));
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
					newStyle.layers[index].layout.visibility = visibility;
				}
			});

			let mapProjection: mapProjectionType;
			if (chapter.projection) {
				mapProjection = chapter.projection;
			} else if ($configStore.projection) {
				mapProjection = $configStore.projection;
			} else {
				mapProjection = 'mercator';
			}
			if (!(mapProjection && (newStyle as StyleSpecification).projection?.type === mapProjection)) {
				(newStyle as StyleSpecification).projection = { type: mapProjection };
			}

			return newStyle;
		} else {
			if (!mapStyle) {
				if (typeof $configStore.style === 'string') {
					const res = await fetch($configStore.style);
					mapStyle = await res.json();
				} else {
					mapStyle = $configStore.style;
				}
			}
			if ($configStore.location?.center && $configStore.location.center[0] !== null) {
				// if center is not undefined, use location from config
				mapStyle.bearing = $configStore.location.bearing ?? 0;
				mapStyle.pitch = $configStore.location.pitch ?? 0;
				mapStyle.center = $configStore.location.center;
				mapStyle.zoom = $configStore.location.zoom;
			}

			let mapProjection: mapProjectionType;
			if ($configStore.projection) {
				mapProjection = $configStore.projection;
			} else if (mapStyle.projection) {
				mapProjection = mapStyle.projection.type as mapProjectionType;
			} else {
				mapProjection = 'mercator';
			}
			if (mapProjection) {
				mapStyle.projection = { type: mapProjection };
			}

			return mapStyle;
		}
	};

	const updateMapStyle = debounce(async () => {
		if (!$mapStore) return;
		if (!mapStyle) return;

		if (chapter) {
			$mapStore.setBearing(chapter.location.bearing);
			$mapStore.setPitch(chapter.location.pitch);

			const location = {
				zoom: chapter.spinGlobe ? 3 : chapter.location.zoom,
				center: chapter.location.center
			};
			if (chapter.mapAnimation === 'easeTo') {
				$mapStore.easeTo(location);
			} else if (chapter.mapAnimation === 'jumpTo') {
				$mapStore.jumpTo(location);
			} else {
				$mapStore.flyTo(location);
			}
		}

		const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
		if (
			!(
				(chapter && lastChapter.id === chapter.id) ||
				(!chapter && $configStore && $configStore.chapters.length === 0)
			)
		) {
			footerHeight = 0;
		}

		const newStyle = await applyLayerEvent();
		$mapStore.setStyle(newStyle);

		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;

		if (!chapter) return;

		if (navigationControl && $mapStore.hasControl(navigationControl)) {
			$mapStore.removeControl(navigationControl);
		}
		if (chapter.mapInteractive) {
			const navPosition = chapter.mapNavigationPosition ?? 'top-right';
			if (!navigationControl) {
				navigationControl = new NavigationControl();
			}
			$mapStore.addControl(navigationControl, navPosition);

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
	}, 300);

	const spinGlobe = () => {
		const center = $mapStore.getCenter();
		const newCenter: [number, number] = [center.lng + 1, center.lat];

		let rotateNumber = $mapStore.getBearing();
		if (chapter && chapter.rotateAnimation) {
			rotateNumber = rotateNumber + 1;
		}

		$mapStore.easeTo(
			{ center: newCenter, bearing: rotateNumber, duration: 100, easing: (n) => n },
			'moveend'
		);
		$mapStore.once('moveend', spinGlobe);
	};

	$effect(() => {
		if (chapter) {
			untrack(() => {
				updateMapStyle();
			});
		}
	});
</script>

<div
	class="map"
	style="width: {width}; height: {height === 0 ? '100%' : `${height - footerHeight}px`};"
	bind:this={mapContainer}
>
	{#if $mapStore && chapter && chapter.style_id && chapter.showLegend}
		{#key chapter}
			<MaplibreLegendControl
				bind:map={$mapStore}
				bind:styleId={chapter.style_id}
				bind:position={chapter.legendPosition}
				showInvisibleLayers={false}
				showInteractive={false}
			/>
		{/key}
	{/if}
</div>

{#if chapter}
	<div class="overlay" style="width: {width};height: {height}px;">
		<StoryMapChapter bind:chapter bind:activeId={chapter.id} bind:template={template_id} />
	</div>
{:else}
	<div class="is-flex is-align-items-center" style="width: {width};height: {height}px;">
		<StoryMapHeader bind:template={template_id} />
	</div>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		position: fixed;
		border: 1px solid #d4d6d8;
		border-top: none;
	}

	.overlay {
		padding-top: 18vh;

		:global(.full) {
			margin: 0 auto !important;
			width: 85% !important;
		}

		:global(.card-content) {
			max-height: 50vh !important;
			overflow-y: auto !important;
		}
	}
</style>
