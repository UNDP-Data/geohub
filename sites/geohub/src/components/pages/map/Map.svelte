<script lang="ts">
	import { page } from '$app/stores';
	import LayerVisibilitySwitcher from '$components/pages/map/plugins/LayerVisibilitySwitcher.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
	import StyleShareControl from '$components/pages/map/plugins/StyleShareControl.svelte';
	import { AdminControlOptions, MapStyles, TourOptions, attribution } from '$lib/config/AppConfig';
	import { fromLocalStorage, getSpriteImageList, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		LAYERLIST_STORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore,
		type SpriteImageStore
	} from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import StyleSwicher from '@undp-data/style-switcher';
	import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';
	import type { TourGuideOptions } from '@watergis/svelte-maplibre-tour';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		TerrainControl,
		type MapOptions,
		type TerrainSpecification
	} from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	const layerList: LayerListStore = getContext(LAYERLIST_STORE_CONTEXT_KEY);

	let tourOptions: TourGuideOptions;
	let tourLocalStorageKey = `geohub-map-${$page.url.host}`;

	let container: HTMLDivElement;
	// let map: Map;
	export let mapOptions: MapOptions;
	export let defaultStyle: string = MapStyles[0].title;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);

	const terrainOptions: TerrainSpecification = {
		source: 'terrarium',
		exaggeration: 1
	};

	onMount(() => {
		mapOptions.container = container;
		$map = new Map(mapOptions);

		$map.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		$map.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		$map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		$map.setMaxPitch(85);
		$map.addControl(new TerrainControl(terrainOptions), 'bottom-right');

		$map.on('styledata', () => {
			const isTerrain = $map.getTerrain();
			if (isTerrain) {
				$map.setTerrain(null);
			}
			if (isTerrain) {
				setTimeout(() => {
					$map.setTerrain(terrainOptions);
				}, 500);
			}
		});

		$map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		$map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');

		$map.once('load', async () => {
			$map.resize();

			const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import(
				'@watergis/maplibre-gl-export'
			);
			const exportControl = new MaplibreExportControl({
				PageSize: Size.A4,
				PageOrientation: PageOrientation.Landscape,
				Format: Format.PNG,
				DPI: DPI[96],
				Crosshair: true,
				PrintableArea: true
			});
			$map.addControl(exportControl, 'top-right');

			const spriteUrl = $map.getStyle().sprite as string;
			const iconList = await getSpriteImageList(spriteUrl);
			spriteImageList.update(() => iconList);

			const { MaplibreTourControl } = await import('@watergis/maplibre-gl-tour');

			tourOptions = TourOptions;
			$map.addControl(
				new MaplibreTourControl(tourOptions, {
					localStorageKey: tourLocalStorageKey
				}),
				'top-right'
			);

			layerList.subscribe((value) => {
				const storageValue = value
					? value
					: initialLayerList && initialLayerList.length > 0
					? initialLayerList
					: null;
				toLocalStorage(layerListStorageKey, storageValue);
			});

			map.subscribe((value) => {
				let storageValue = value ? value.getStyle() : null;
				toLocalStorage(mapStyleStorageKey, storageValue);
			});
			$map.on('styledata', async () => {
				let storageValue = $map.getStyle();
				toLocalStorage(mapStyleStorageKey, storageValue);
			});
		});
	});
</script>

<div bind:this={container} class="map" />
{#if $map}
	<MapQueryInfoControl bind:map={$map} />
	<StyleShareControl bind:map={$map} />
	<StyleSwicher bind:map={$map} styles={MapStyles} {defaultStyle} position="bottom-left" />
	<LayerVisibilitySwitcher bind:map={$map} position="bottom-right" />
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	@import '@sjmc11/tourguidejs/dist/css/tour.min.css';
	@import '@watergis/maplibre-gl-tour/dist/maplibre-tour-control.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	:global(button.tg-dialog-btn) {
		cursor: pointer;
	}
</style>
