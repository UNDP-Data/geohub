<script lang="ts">
	import { page } from '$app/stores';
	import MapQueryInfoControl from '$components/MapQueryInfoControl.svelte';
	import StyleShareControl from '$components/StyleShareControl.svelte';
	import { AdminControlOptions, MapStyles, TourOptions, attribution } from '$lib/config/AppConfig';
	import { fromLocalStorage, getSpriteImageList, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { layerList as layerListStore, map as mapStore, spriteImageList } from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import StyleSwicher from '@undp-data/style-switcher';
	import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';
	import TourControl, { type TourGuideOptions } from '@watergis/svelte-maplibre-tour';
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
	import { onMount } from 'svelte';
	import LayerVisibilitySwitcher from './LayerVisibilitySwitcher.svelte';

	let tourOptions: TourGuideOptions;
	let tourLocalStorageKey = `geohub-map-${$page.url.host}`;

	let container: HTMLDivElement;
	let map: Map;
	export let mapOptions: MapOptions;
	export let layerList: Layer[];
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
		map = new Map(mapOptions);

		map.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		map.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		map.setMaxPitch(85);
		map.addControl(new TerrainControl(terrainOptions), 'bottom-right');

		map.on('styledata', () => {
			const isTerrain = map.getTerrain();
			if (isTerrain) {
				map.setTerrain(null);
			}
			if (isTerrain) {
				setTimeout(() => {
					map.setTerrain(terrainOptions);
				}, 500);
			}
		});

		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');

		map.once('load', async () => {
			map.resize();

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
			map.addControl(exportControl, 'top-right');

			const spriteUrl = map.getStyle().sprite as string;
			const iconList = await getSpriteImageList(spriteUrl);
			spriteImageList.update(() => iconList);

			tourOptions = TourOptions;

			$layerListStore = [...layerList];
			$mapStore = map;

			layerListStore.subscribe((value) => {
				const storageValue = value
					? value
					: initialLayerList && initialLayerList.length > 0
					? initialLayerList
					: null;
				toLocalStorage(layerListStorageKey, storageValue);
			});

			mapStore.subscribe((value) => {
				let storageValue = value ? value.getStyle() : null;
				toLocalStorage(mapStyleStorageKey, storageValue);
			});
			map.on('styledata', async () => {
				let storageValue = map.getStyle();
				toLocalStorage(mapStyleStorageKey, storageValue);
			});
		});
	});
</script>

<div bind:this={container} class="map" />
{#if map}
	<MapQueryInfoControl bind:map />
	<StyleShareControl bind:map />
	<StyleSwicher bind:map styles={MapStyles} {defaultStyle} position="bottom-left" />
	<LayerVisibilitySwitcher bind:map position="bottom-right" />

	{#if tourOptions}
		<TourControl
			bind:map
			bind:tourguideOptions={tourOptions}
			bind:localStorageKey={tourLocalStorageKey}
		/>
	{/if}
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}
</style>
