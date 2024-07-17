<script context="module" lang="ts">
	export interface DashboardType {
		name: string;
		text: string;
		mapIcon: string;
		mapIconAlt: string;
		show: boolean;
		help: string;
	}

	export interface DashBoardDataset {
		year: number;
		id: string;
		url?: string;
	}
</script>

<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { downloadFile } from '$lib/helper';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { handleEnterKey } from '@undp-data/svelte-geohub-static-image-controls';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
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
	import Charts from './components/Charts.svelte';
	import ElectricityControl from './components/ElectricityControl.svelte';
	import ExploreEvolution from './components/ExploreEvolution.svelte';
	import IntroductionPanel from './components/IntroductionPanel.svelte';
	import TimeSliderControl from './components/TimeSliderControl.svelte';
	import { ELECTRICITY_DATASETS } from './constansts';
	import { hrea, map as mapStore } from './stores';
	import {
		createElectricityDataTypeStore,
		ELECTRICITY_DATATYPE_CONTEXT_KEY
	} from './stores/electricityDataType';
	import { loadAdmin, setAzureUrl, unloadAdmin } from './utils/adminLayer';

	export let data: PageData;

	const tippyTooltip = initTooltipTippy();

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const electricityDataType = createElectricityDataTypeStore();
	setContext(ELECTRICITY_DATATYPE_CONTEXT_KEY, electricityDataType);

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

	let colormapName = 'pubu';
	let scaleColorList: string[] = [];
	let newColorExpression = undefined;

	let isTimeSliderActive = false;

	onMount(() => {
		const promises = loadDatasets();
		promises.hrea.then((datasets) => {
			hrea.update(() => datasets);
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
			adminOptions.isHover = false;
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

		const hrea: Promise<DashBoardDataset>[] = [];

		for (const ds of datasets.hrea) {
			hrea.push(
				new Promise<DashBoardDataset>((resolve) => {
					fetch(`/api/datasets/${ds.id}`)
						.then((res) => res.json())
						.then((data) => {
							const dataset: DashBoardDataset = ds;
							dataset.url = data.properties.url;
							resolve(dataset);
						});
				})
			);
		}

		const hreaData = Promise.all(hrea);

		return {
			hrea: hreaData
		};
	};

	let loadLayers = () => {
		loadRasterLayer();
		loadAdmin(false);
	};

	// Electricity Dashboard v2 -- start
	let showDialog = false;

	let layers = [
		{ text: 'ADM0', format: 'CSV', showDropdown: false },
		{ text: 'ADM1', format: 'CSV', showDropdown: false },
		{ text: 'ADM2', format: 'CSV', showDropdown: false },
		{ text: 'ADM3', format: 'CSV', showDropdown: false },
		{ text: 'ADM4', format: 'CSV', showDropdown: false }
	];
	let formats = ['CSV', 'XLSX', 'GPKG', 'SHP'];

	const HREA_ID = 'HREA';
	const NONE_ID = 'NONE';

	let activeDashboard: DashboardType;
	let dashboardSelections: DashboardType[] = [
		{
			name: 'explore',
			text: 'Explore the evolution of electricity access at administrative level.',
			mapIcon: '/assets/img/explore.svg',
			mapIconAlt: 'Explore',
			show: false,
			help: 'A selected year data can be overlaid on the map. The layer is a summary of HREA electrification by administrative areas and using a custom population raster to calculate the percentage of population with electricity access in each area.'
		},
		{
			name: 'compare',
			// text: 'Compare empirical with maschine learning data.',
			text: 'View electricity access data.',
			mapIcon: '/assets/img/compare.svg',
			mapIconAlt: 'Compare',
			show: false,
			help: `Two types of data can be selelected to allow you to compare electricity access rate for your interested area across multiple years. Select data type either settlement-level electricity access (2012-2020) or electricity access forecast (2021-2030), then get layer statistics for a single pixel (1km x 1km) by clicking anywhere on the map.`
		},
		{
			name: 'analyse',
			text: 'Analyse bivariate data for wealth and access to electricity.',
			mapIcon: '/assets/img/analyse.svg',
			mapIconAlt: 'Analyse',
			show: false,
			help: `This provide a slightly different way for you to explore data by using bivariate data matrix table for wealth index and electricity access. By clicking any cell that you are interested in, the tool automatically filter data on the map to find which administrative area is related.`
		}
	];

	let electricityChoices = [{ name: HREA_ID, title: 'Electricity Access Data' }];

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
		activeDashboard = dashboardSelections.find((d) => d.show === true);
		isTimeSliderActive = setTimeSliderActive();
		if (dashboardSelections[index].name === 'compare') {
			electricitySelected = electricityChoices[0].name;
			unloadAdmin();
		} else {
			electricitySelected = NONE_ID;
		}
	};

	const setTimeSliderActive = () => {
		return activeDashboard?.name !== 'analyse';
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

<Sidebar
	show={true}
	position="left"
	bind:width={drawerWidth}
	bind:marginTop={$headerHeightStore}
	border="none"
>
	<div slot="content" class="drawer-content m-0 px-4 pt-6">
		<h2 class="title is-size-6 mb-4">DASHBOARD</h2>
		<h2 class="title is-size-4 mb-5">Electricity Access Estimate</h2>

		{#if showIntro}
			<IntroductionPanel
				bind:dashboardSelections
				on:click={() => {
					showIntro = false;
					activeDashboard = dashboardSelections.find((d) => d.show === true);
					if (activeDashboard.name === 'compare') {
						electricitySelected = electricityChoices[0].name;
						unloadAdmin();
					} else {
						electricitySelected = NONE_ID;
					}
					isTimeSliderActive = setTimeSliderActive();
				}}
			/>
		{:else}
			{#if activeDashboard}
				{#each dashboardSelections as dbs, index (dbs.name)}
					<div class="a-box p-4 mb-4 {activeDashboard.name === dbs.name ? 'active' : ''}">
						<button
							class="a-reset a-button is-flex is-flex-wrap-wrap is-flex-direction-row is-justify-content-space-between is-align-items-flex-start
							{dbs.show ? 'mb-4' : ''}"
							style="width: 100%"
							type="button"
							on:click={() => optionsHandler(index)}
						>
							<div
								class="a-title__container is-flex is-justify-content-space-between is-align-items-center"
							>
								<span class="a-title">{dbs.text}</span>
							</div>
							<span class="material-icons-outlined" use:tippyTooltip={{ content: dbs.help }}>
								info
							</span>
						</button>

						{#if dbs.show && dbs.name === 'explore'}
							<ExploreEvolution bind:showMapLabels bind:scaleColorList />
						{:else if dbs.show && dbs.name === 'compare'}
							<div>
								<ElectricityControl
									bind:electricitySelected
									on:change={(e) => {
										colormapName = e.detail.colormapName;
									}}
								/>
								<Charts />
							</div>
						{:else if dbs.show && dbs.name === 'analyse'}
							<AnalyzeBivariate />
						{/if}
					</div>
				{/each}
			{/if}

			<div class="mt-auto mb-4 a-bb-1 pb-4">
				<CtaLink label="Download" isArrow on:clicked={modalHandler} />
			</div>
		{/if}
	</div>

	<div slot="main">
		<div class="map" id="map" bind:this={mapContainer}>
			{#if map}
				<TimeSliderControl
					bind:map
					bind:electricitySelected
					bind:loadRasterLayer
					bind:scaleColorList
					bind:rasterColorMapName={colormapName}
					bind:loadAdminLabels={showMapLabels}
					bind:newColorExpression
					bind:isActive={isTimeSliderActive}
				/>
			{/if}
		</div>
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
						<span class="material-icons"> download </span>
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

		&-show__hidden {
			overflow: visible;
		}
	}
</style>
