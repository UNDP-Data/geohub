<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { downloadFile } from '$lib/helper';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	// import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { handleEnterKey } from '@undp-data/svelte-geohub-static-image-controls';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import { CtaLink } from '@undp-data/svelte-undp-design';
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
	import AnalyzeBivariate from './components/AnalyzeBivariate.svelte';
	import ExploreEvolution from './components/ExploreEvolution.svelte';
	import IntroductionPanel from './components/IntroductionPanel.svelte';
	import { ELECTRICITY_DATASETS } from './constansts';
	import type { Dataset } from './interfaces';
	import { hrea, map as mapStore, ml } from './stores';
	import { loadAdmin, setAzureUrl, unloadAdmin } from './utils/adminLayer';
	import ElectricityControl from './components/ElectricityControl.svelte';
	import Charts from './components/Charts.svelte';

	export let data: PageData;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const azureUrl = data.azureUrl;
	setAzureUrl(azureUrl);

	let styles = MapStyles;

	let mapContainer: HTMLDivElement;
	let map: Map;

	let showIntro = true;
	let showMapLabels = true;
	let electricitySelected: string;
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
			// map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');
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
		loadAdmin(false);
	};

	// Electricity Dashboard v2 -- start
	let showDialog = false;
	let POVERTY_ID = 'poverty';

	let layers = [
		{ text: 'ADM0', format: 'CSV', showDropdown: false },
		{ text: 'ADM1', format: 'CSV', showDropdown: false },
		{ text: 'ADM2', format: 'CSV', showDropdown: false },
		{ text: 'ADM3', format: 'CSV', showDropdown: false },
		{ text: 'ADM4', format: 'CSV', showDropdown: false }
	];
	let formats = ['CSV', 'XLSX', 'GPKG', 'SHP'];

	const HREA_ID = 'HREA';
	const ML_ID = 'ML';
	const NONE_ID = 'NONE';

	let dashboardSelections = [
		{
			name: 'explore',
			text: 'Explore the evolution of electricity access at administrative level.',
			mapIcon: '/assets/img/explore.svg',
			mapIconAlt: 'Explore',
			show: false
		},
		{
			name: 'compare',
			text: 'Compare empirical with maschine learning data.',
			mapIcon: '/assets/img/compare.svg',
			mapIconAlt: 'Compare',
			show: false
		},
		{
			name: 'analyse',
			text: 'Analyse bivariate data for wealth and access to electricity.',
			mapIcon: '/assets/img/analyse.svg',
			mapIconAlt: 'Analyse',
			show: false
		}
	];

	let electricityChoices = [
		{ name: HREA_ID, title: 'Electricity Access Data' },
		{ name: ML_ID, title: 'Machine Learning Data' }
	];
	electricitySelected = electricityChoices[1].name;

	const download = (layer: string, format: string) => {
		const url = `https://data.undpgeohub.org/admin/${layer.toLowerCase()}_polygons.${format.toLowerCase()}.zip`;
		downloadFile(url);
	};

	const modalHandler = () => {
		showDialog = !showDialog;
	};

	const optionsHandler = (index: number) => {
		dashboardSelections.forEach((dbs) => (dbs.show = false));
		dashboardSelections[index].show = !dashboardSelections[index].show;
		if (dashboardSelections[index].name === 'compare') {
			electricitySelected = electricityChoices[0].name;
			unloadAdmin();
		} else {
			electricitySelected = NONE_ID;
		}
	};

	const dropdownHandler = (index: number) => {
		layers.forEach((l) => (l.showDropdown = false));
		layers[index].showDropdown = !layers[index].showDropdown;
	};

	const dropdownSelectedHandler = (index: number, format: string) => {
		layers[index].format = format;
		layers[index].showDropdown = !layers[index].showDropdown;
	};
	// Electricity Dashboard v2 -- end
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="left" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div slot="content" class="drawer-content m-0 px-4 pt-6">
		<h2 class="title is-size-6 mb-4">DASHBOARD</h2>
		<h2 class="title is-size-4 mb-5">Affordable and clean energy</h2>

		<IntroductionPanel bind:dashboardSelections bind:showIntro />

		{#if !showIntro}
			{#each dashboardSelections as dbs, index (dbs.name)}
				<div class="a-box p-4 mb-4 {dbs.show ? 'active' : ''}">
					<button
						class="a-reset a-button is-flex is-flex-wrap-wrap is-flex-direction-row is-justify-content-space-between is-align-items-flex-start
							{dbs.show ? 'mb-4' : ''}"
						type="button"
						on:click={() => optionsHandler(index)}
					>
						<div
							class="a-title__container is-flex is-justify-content-space-between is-align-items-center"
						>
							<span class="a-title">{dbs.text}</span>
						</div>
						<img src="/assets/img/information.svg" alt="Information" />
					</button>

					{#if dbs.show && dbs.name === 'explore'}
						<ExploreEvolution
							bind:electricitySelected
							bind:loadRasterLayer
							bind:POVERTY_ID
							bind:showMapLabels
						/>
					{:else if dbs.show && dbs.name === 'compare'}
						<div>
							<ElectricityControl bind:electricitySelected bind:loadRasterLayer />
							<Charts />
						</div>
					{:else if dbs.show && dbs.name === 'analyse'}
						<AnalyzeBivariate />
					{/if}
				</div>
			{/each}

			<button class="a-reset a-full-w mt-6 a-bb-1 pb-4" type="button" on:click={modalHandler}>
				<CtaLink label="Download" isArrow />
			</button>
		{/if}
	</div>

	<div slot="main">
		<div class="map" id="map" bind:this={mapContainer} />
	</div>
</Sidebar>

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-background" role="dialog" on:click={modalHandler}></div>
	<div class="modal-content a-show__hidden has-background-white p-4">
		<div class="is-flex is-justify-content-space-between is-align-items-flex-end">
			<p class="is-size-4"><strong>Download data</strong></p>
			<button class="delete is-white is-large mb-6" aria-label="close" on:click={modalHandler}
			></button>
		</div>

		{#each layers as l, index}
			<div
				class="is-flex is-flex-wrap-wrap is-justify-content-space-between is-align-items-center a-box p-4 mt-4"
			>
				<p>
					<strong>Country level data</strong>
					<br />
					{l.text}
				</p>

				<div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end is-align-items-center">
					<div class="dropdown {l.showDropdown ? 'is-active' : ''}">
						<div class="dropdown-trigger">
							<button
								class="button"
								aria-haspopup="true"
								aria-controls="dropdown-menu"
								on:click={() => dropdownHandler(index)}
							>
								<span>{l.format}</span>
								<span class="icon is-small">
									<i class="fas fa-angle-down" aria-hidden="true"></i>
								</span>
							</button>
						</div>

						<div class="dropdown-menu" id="dropdown-menu" role="menu">
							<div class="dropdown-content">
								{#each formats as f}
									<div
										class="dropdown-item a-button"
										role="button"
										tabindex="0"
										on:click={() => dropdownSelectedHandler(index, f)}
										on:keydown={handleEnterKey}
									>
										{f}
									</div>
								{/each}
							</div>
						</div>
					</div>

					<button
						class="a-reset a-button ml-4"
						type="button"
						on:click={() => download(l.text, l.format)}
					>
						<img src="/assets/img/download.svg" alt="" />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

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

	.a {
		&-reset {
			all: unset;
		}

		&-box {
			border: 1px solid #e1e3e5;
			transition: all ease 0.3s;

			&:hover,
			&.active {
				border-color: #006eb5;
			}
		}

		&-button {
			cursor: pointer;
		}

		&-title {
			width: calc(100% - 50px);

			&__container {
				width: calc(100% - 34px);
			}
		}

		&-bb-1 {
			border-bottom: 1px solid #e1e3e5;
		}

		&-full-w {
			width: 100%;
		}

		&-show__hidden {
			overflow: visible;
		}
	}
</style>
