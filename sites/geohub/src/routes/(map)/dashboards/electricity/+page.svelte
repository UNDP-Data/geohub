<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';
	import Charts from './components/Charts.svelte';
	import DownloadData from './components/DownloadData.svelte';
	import ElectricityControl from './components/ElectricityControl.svelte';
	import IntroductionPanel from './components/IntroductionPanel.svelte';
	import OverlayControl from './components/OverlayControl.svelte';
	import { ELECTRICITY_DATASETS } from './constansts';
	import type { Dataset } from './interfaces';
	import { hrea, map as mapStore, ml } from './stores';
	import { loadAdmin, setAzureUrl } from './utils/adminLayer';

	export let data: PageData;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const azureUrl = data.azureUrl;
	setAzureUrl(azureUrl);

	let styles = MapStyles;

	let mapContainer: HTMLDivElement;
	let map: Map;

	let showIntro = true;
	let drawerWidth = '355px';

	let loadRasterLayer = () => {
		return;
	};

	onMount(() => {
		const promises = loadDatasets();
		promises.hrea.then((datasets) => {
			hrea.update(() => datasets);
		});
		promises.ml.then((datasets) => {
			ml.update(() => datasets);
		});

		map = new Map({
			container: mapContainer,
			style: styles[0].uri,
			center: [0, 0],
			zoom: 2.5,
			hash: true,
			attributionControl: false
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'top-right'
		);
		map.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
		map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
		map.getCanvas().style.cursor = 'pointer';

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
		map.addControl(styleSwitcher, 'bottom-left');

		map.on('load', () => {
			map.resize();

			styleSwitcher.initialise();

			const adminOptions = AdminControlOptions;
			adminOptions.isHover = true;
			map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');
		});

		mapStore.update(() => map);

		mapStore.subscribe(() => {
			if ($mapStore) {
				$mapStore.on('load', () => {
					loadLayers();
				});
			}
		});
	});

	const loadDatasets = () => {
		const datasets = ELECTRICITY_DATASETS;

		const hrea: Promise<Dataset>[] = [];

		for (const ds of datasets.hrea) {
			hrea.push(
				new Promise<Dataset>((resolve) => {
					fetch(`/api/datasets/${ds.id}`)
						.then((res) => res.json())
						.then((data) => {
							const dataset: Dataset = ds;
							dataset.url = data.properties.url;
							resolve(dataset);
						});
				})
			);
		}

		const ml: Promise<Dataset>[] = [];

		for (const ds of datasets.ml) {
			ml.push(
				new Promise<Dataset>((resolve) => {
					fetch(`/api/datasets/${ds.id}`)
						.then((res) => res.json())
						.then((data) => {
							const dataset: Dataset = ds;
							dataset.url = data.properties.url;
							resolve(dataset);
						});
				})
			);
		}

		const hreaData = Promise.all(hrea);
		const mlData = Promise.all(ml);

		return {
			hrea: hreaData,
			ml: mlData
		};
	};

	let loadLayers = () => {
		loadRasterLayer();
		loadAdmin(true);
	};
</script>

<Header isPositionFixed={true} />

<Sidebar
	show={true}
	position="left"
	bind:width={drawerWidth}
	bind:marginTop={$headerHeightStore}
	border="none"
>
	<div slot="content" class="drawer-content m-0 px-4 pt-4">
		<p class="title is-4 m-0 p-0 pb-2 has-text-centered">UNDP Electricity Dashboard</p>
		<IntroductionPanel bind:showIntro />

		{#if !showIntro}
			<div class="box mx-0 my-1">
				<p class="title is-5 p-0 m-0 has-text-centered pb-2">Raw Data - Electricity Access</p>
				<ElectricityControl bind:loadRasterLayer />
			</div>
			<div class="box mx-0 my-1">
				<p class="title is-5 p-0 m-0 has-text-centered pb-2">Overlays</p>
				<OverlayControl />
			</div>
			<div class="box mx-0 my-1">
				<p class="title is-5 p-0 m-0 has-text-centered pb-2">Statistics - Electricity Access</p>
				<Charts />
			</div>
			<div class="box mx-0 my-1">
				<p class="title is-5 p-0 m-0 has-text-centered pb-2">Statistics - Download</p>
				<DownloadData />
			</div>
		{/if}
	</div>
	<div slot="main">
		<div class="map" id="map" bind:this={mapContainer} />
	</div>
</Sidebar>

<style lang="scss">
	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	.drawer-content {
		width: 100%;
		height: 100%;
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-basis: 100%;
		flex: 1;
	}
</style>
