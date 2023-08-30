<script lang="ts">
	import { page } from '$app/stores';
	import { MapStyles, SiteInfo } from '$lib/config/AppConfig';
	import { onMount } from 'svelte';
	import Content from './components/Content.svelte';
	import Map from './components/Map.svelte';
	import { hrea, ml } from './stores';
	import { ELECTRICITY_DATASETS } from './constansts';
	import type { Dataset } from './interfaces';
	import * as pmtiles from 'pmtiles';
	import maplibregl from 'maplibre-gl';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	onMount(() => {
		const promises = loadDatasets();
		promises.hrea.then((datasets) => {
			hrea.update(() => datasets);
		});
		promises.ml.then((datasets) => {
			ml.update(() => datasets);
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
		return;
	};

	let styles = MapStyles;

	let title = 'Electricity Dashboard | GeoHub';
	let content = 'Electricity dashboard';
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

<Content bind:loadLayers>
	<Map on:styleChanged={loadLayers} bind:styles />
</Content>

<style lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
</style>
