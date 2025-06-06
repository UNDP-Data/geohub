<script module lang="ts">
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
		downloadUrl?: string;
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { downloadFile } from '$lib/helper';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import '@maptiler/geocoding-control/style.css';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import {
		type ControlOptions,
		MaplibreStaticImageControl
	} from '@undp-data/svelte-geohub-static-image-controls';
	import { initTooltipTippy, ModalTemplate, Sidebar } from '@undp-data/svelte-undp-components';
	import { CtaLink } from '@undp-data/svelte-undp-design';
	import {
		addProtocol,
		AttributionControl,
		GeolocateControl,
		GlobeControl,
		Map,
		NavigationControl,
		ScaleControl
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
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
	import { loadAdmin, setAdminUrl, unloadAdmin } from './utils/adminLayer';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const tippyTooltip = initTooltipTippy();

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const electricityDataType = createElectricityDataTypeStore();
	setContext(ELECTRICITY_DATATYPE_CONTEXT_KEY, electricityDataType);

	const adminUrl = data.adminUrl;
	setAdminUrl(adminUrl);

	let styleUrl = MapStyles[0].uri;
	let exportOptions: ControlOptions = $state({
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		ratio: 1,
		defaultApi: 'center',
		extension: 'png',
		pageSize: 'A4',
		orientation: 'landscape'
	});

	let mapContainer: HTMLDivElement = $state();
	let map: Map = $state();

	let showIntro = $state(true);
	let showMapLabels = $state(true);
	let electricitySelected: string = $state('');
	let drawerWidth = $state(355);

	let colormapName = $state('pubu');
	let scaleColorList: string[] = $state([]);
	let newColorExpression = $state(undefined);

	let isTimeSliderActive = $state(false);
	let isInitialized = $state(false);

	onMount(async () => {
		let protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);

		const promises = loadDatasets();
		promises.hrea.then((datasets) => {
			hrea.update(() => datasets);
		});

		map = new Map({
			container: mapContainer,
			style: styleUrl,
			center: [0, 0],
			zoom: 2.5,
			hash: true,
			attributionControl: false,
			maxPitch: 85
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'top-right'
		);
		map.addControl(new GlobeControl(), 'top-right');
		map.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
		map.addControl(
			new AttributionControl({ compact: true, customAttribution: data.attribution }),
			'bottom-right'
		);
		map.getCanvas().style.cursor = 'pointer';

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
		map.addControl(styleSwitcher, 'bottom-left');

		if (browser) {
			const { GeocodingControl } = await import('@maptiler/geocoding-control/maplibregl');
			const apiKey = page.data.maptilerKey;
			if (apiKey) {
				const gc = new GeocodingControl({
					apiKey: apiKey,
					marker: true,
					showResultsWhileTyping: false,
					collapsed: false
				});
				map.addControl(gc, 'top-left');
			}
		}

		isInitialized = true;

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

							const download = data.properties.links.find((l) => l.rel === 'download')?.href;
							if (download) {
								dataset.downloadUrl = download;
							}

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

	let timeSliderControl: TimeSliderControl | undefined = $state();
	let loadLayers = () => {
		timeSliderControl?.loadRasterLayer();
		loadAdmin(false);
	};

	// Electricity Dashboard v2 -- start
	let showDialog = $state(false);

	let layers = $state([
		{
			text: 'COG',
			title: 'Settlement-level electricty access',
			format: '2012',
			years: [2012, 2020]
		},
		{
			text: 'COG',
			title: 'Electricty access forecast',
			format: '2021',
			years: [2021, 2030]
		},
		{ text: 'ADM0', title: 'National level data', format: 'CSV' },
		{ text: 'ADM1', title: 'Subnational level data', format: 'CSV' },
		{ text: 'ADM2', title: 'Subnational level 2 data', format: 'CSV' }
		// { text: 'ADM3', title: 'Subnational level 3 data', format: 'CSV' },
		// { text: 'ADM4', title: 'Subnational level 4 data', format: 'CSV' }
	]);
	let formats = ['CSV', 'XLSX', 'GPKG', 'SHP', 'FGB', 'PMTILES'];

	const HREA_ID = 'HREA';
	const NONE_ID = 'NONE';

	let activeDashboard: DashboardType = $state();
	let dashboardSelections: DashboardType[] = $state([
		{
			name: 'explore',
			text: 'Electricity access data at district, province and country level',
			mapIcon: '/assets/img/explore.svg',
			mapIconAlt: 'Explore',
			show: false,
			help: 'A selected year data can be overlaid on the map. The layer is a summary of HREA electrification by administrative areas and using a custom population raster to calculate the percentage of population with electricity access in each area.'
		},
		{
			name: 'compare',
			// text: 'Compare empirical with maschine learning data.',
			text: 'High resolution electricity access data for the past and future',
			mapIcon: '/assets/img/compare.svg',
			mapIconAlt: 'Compare',
			show: false,
			help: `Two types of data can be selelected to allow you to compare electricity access rate for your interested area across multiple years. Select data type either settlement-level electricity access (2012-2020) or electricity access forecast (2021-2030), then get layer statistics for a single pixel (1km x 1km) by clicking anywhere on the map.`
		},
		{
			name: 'analyse',
			text: 'Relationship between electricity access and other indicators (e.g. wealth)',
			mapIcon: '/assets/img/analyse.svg',
			mapIconAlt: 'Analyse',
			show: false,
			help: `This provide a slightly different way for you to explore data by using bivariate data matrix table for wealth index and electricity access. By clicking any cell that you are interested in, the tool automatically filter data on the map to find which administrative area is related.`
		}
	]);

	let electricityChoices = [{ name: HREA_ID, title: 'Electricity Access Data' }];

	const download = (layer: string, format: string) => {
		if (layer.toLowerCase() === 'cog') {
			const dataset = $hrea.find((d) => d.year === Number(format));
			if (dataset) {
				const url = dataset.downloadUrl;
				downloadFile(url);
			}
		} else {
			let url = `${data.adminUrl}/${layer.toLowerCase()}_polygons.${format.toLowerCase()}`;

			if (!['fgb', 'pmtiles'].includes(format.toLowerCase())) {
				url = `${url}.zip`;
			}

			downloadFile(url);
		}
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
</script>

<svelte:head>
	<style type="text/css">
		html {
			overflow-y: hidden !important;
		}
	</style>
</svelte:head>

<Header isPositionFixed={true} />

<Sidebar
	show={true}
	position="left"
	bind:width={drawerWidth}
	bind:marginTop={$headerHeightStore}
	border="none"
>
	{#snippet content()}
		<div class="drawer-content m-0 px-4 pb-4">
			<h2 class="title is-size-6 mt-4 mb-4">DASHBOARD</h2>
			<h2 class="title is-size-4">Electricity Access Dashboard</h2>
			<p class="mb-5">
				<b
					>Developed with IBM through the <a
						href="https://www.ibm.com/impact/initiatives/ibm-sustainability-accelerator"
						>IBM Sustainability Accelerator</a
					></b
				>
			</p>
			{#if showIntro}
				<IntroductionPanel
					bind:dashboardSelections
					onclick={() => {
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
								onclick={() => optionsHandler(index)}
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
								<ElectricityControl bind:electricityDataType={$electricityDataType} />
								<ExploreEvolution bind:showMapLabels bind:scaleColorList />
							{:else if dbs.show && dbs.name === 'compare'}
								<div>
									<ElectricityControl bind:electricityDataType={$electricityDataType} />

									<div class="electricity-legend">
										<div
											class="is-flex is-flex-direction-column mt-2"
											style="background-color: #F7F7F7"
										>
											<div class="is-flex is-align-items-center p-2 border-bottom">
												<div class="legend without_electricity"></div>
												&nbsp;-&nbsp;<span class="is-capitalized">without electricity</span>
											</div>
											<div class="is-flex is-align-items-center p-2">
												<div class="legend electrified"></div>
												&nbsp;-&nbsp;<span class="is-capitalized">electrified</span>
											</div>
										</div>
									</div>

									<Charts />
								</div>
							{:else if dbs.show && dbs.name === 'analyse'}
								<AnalyzeBivariate />
							{/if}
						</div>
					{/each}
				{/if}

				<div class="mt-auto mb-4 a-bb-1 pb-4">
					<CtaLink label="Download" isArrow onclick={modalHandler} />
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet main()}
		<div>
			<div class="map" id="map" bind:this={mapContainer}>
				{#if map}
					{#if isInitialized === true}
						<TimeSliderControl
							bind:this={timeSliderControl}
							bind:map
							bind:electricitySelected
							bind:scaleColorList
							bind:rasterColorMapName={colormapName}
							bind:loadAdminLabels={showMapLabels}
							bind:newColorExpression
							bind:isActive={isTimeSliderActive}
						/>
					{/if}

					<MaplibreStaticImageControl
						bind:map
						show={false}
						style={styleUrl}
						apiBase={data.staticApiUrl}
						bind:options={exportOptions}
						hiddenApiTypes={true}
						position="top-right"
					/>
				{/if}
			</div>
		</div>
	{/snippet}
</Sidebar>

<ModalTemplate title="Download data" bind:show={showDialog}>
	{#snippet content()}
		<div class="download-contents">
			{#each layers as l, index (index)}
				<div
					class="is-flex is-flex-wrap-wrap is-justify-content-space-between is-align-items-center a-box p-4 mt-4"
				>
					<p>
						<strong>{l.title}</strong>
						<br />
						{l.text}
					</p>

					<div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end is-align-items-center">
						{#if l.text === 'COG'}
							<div class="select">
								<select bind:value={l.format}>
									{#if $hrea}
										{#each $hrea as dataset (dataset.year)}
											{#if 'years' in l && dataset.year >= l.years[0] && dataset.year <= l.years[1]}
												<option value={dataset.year.toString()}>{dataset.year}</option>
											{/if}
										{/each}
									{/if}
								</select>
							</div>
						{:else}
							<div class="select">
								<select bind:value={l.format}>
									{#each formats as f (f)}
										<option value={f}>{f}</option>
									{/each}
								</select>
							</div>
						{/if}

						<button class="download-button button ml-2" onclick={() => download(l.text, l.format)}>
							<span class="icon is-small">
								<span class="material-icons"> download </span>
							</span>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/snippet}
</ModalTemplate>

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
	}

	.download-contents {
		max-height: 500px;
		overflow-y: auto;

		.download-button {
			border: none;
			box-shadow: none;
		}
	}

	.electricity-legend {
		.border-bottom {
			border-bottom: 1px solid #d4d6d8;
		}

		.legend {
			height: 20px;
			width: 20px;

			&.without_electricity {
				background-color: rgb(12, 12, 12);
			}

			&.electrified {
				background-color: rgb(242, 166, 4);
			}
		}
	}
</style>
