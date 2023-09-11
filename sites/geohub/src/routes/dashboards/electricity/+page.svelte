<script lang="ts">
	import { page } from '$app/stores';
	import { MapStyles, SiteInfo } from '$lib/config/AppConfig';
	import { MenuControl } from '@watergis/svelte-maplibre-menu';
	import maplibregl from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Charts from './components/Charts.svelte';
	import DownloadData from './components/DownloadData.svelte';
	import ElectricityControl from './components/ElectricityControl.svelte';
	import IntroductionPanel from './components/IntroductionPanel.svelte';
	import Map from './components/Map.svelte';
	import OverlayControl from './components/OverlayControl.svelte';
	import { ELECTRICITY_DATASETS } from './constansts';
	import type { Dataset } from './interfaces';
	import { hrea, map, ml } from './stores';
	import { loadAdmin, setAzureUrl } from './utils/adminLayer';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	export let data: PageData;

	const azureUrl = data.azureUrl;
	setAzureUrl(azureUrl);

	let styles = MapStyles;

	let title = 'Electricity Dashboard | GeoHub';
	let content = 'Electricity dashboard';

	let showIntro = true;
	let electricitySelected: {
		name: string;
		icon: string;
		title: string;
	};
	let drawerWidth = 355;
	let isResizingDrawer = false;

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

		document.addEventListener('mousemove', (e) => handleMousemove(e));
		document.addEventListener('mouseup', handleMouseup);
		map.subscribe(() => {
			if ($map) {
				$map.on('load', () => {
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

	const handleMousemove = (e: MouseEvent | TouchEvent) => {
		if (!isResizingDrawer) return;

		if (e instanceof MouseEvent) drawerWidth = e.clientX;
		if (e instanceof TouchEvent) drawerWidth = e.touches?.[0].pageX;
	};
	const handleMouseup = () => (isResizingDrawer = false);
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />

	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<MenuControl
	bind:map={$map}
	position={'top-left'}
	isMenuShown={true}
	minSidebarWidth={`${drawerWidth}px`}
	initialSidebarWidth={drawerWidth}
>
	<div slot="sidebar" class="drawer-content container m-0 px-4 pt-4">
		<p class="title is-4 m-0 p-0 pb-2 has-text-centered">UNDP Electricity Dashboard</p>
		<IntroductionPanel bind:showIntro />

		{#if !showIntro}
			<div class="box mx-0 my-1">
				<p class="title is-5 p-0 m-0 has-text-centered pb-2">Raw Data - Electricity Access</p>
				<ElectricityControl bind:electricitySelected bind:loadRasterLayer />
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
		<div />
	</div>
	<div slot="map" class="main-content">
		<Map on:styleChanged={loadLayers} bind:styles />
	</div>
</MenuControl>

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';

	p {
		padding: 10px;
		border-radius: 5px;
	}

	.main-content {
		overflow: hidden;
		display: flex;
		height: 100%;
		flex-grow: 1;
		z-index: -1;
		flex-direction: row;
		flex-wrap: wrap;
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
