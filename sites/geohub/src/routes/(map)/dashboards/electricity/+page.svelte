<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { downloadFile } from '$lib/helper';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
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
	import IntroductionPanel from './components/IntroductionPanel.svelte';
	import TimeSlider from './components/TimeSlider.svelte';
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
	let electricitySelected: {
		name: string;
		icon: string;
		title: string;
	};
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

	// Electricity Dashboard v2 -- start
	let showExplore = false;
	let showCompare = false;
	let showAnalyse = false;
	let showLegend = true;
	let POVERTY_ID = 'poverty';

	let layers = ['ADM0', 'ADM1', 'ADM2', 'ADM3', 'ADM4'];
	let layer = 'ADM0';
	let formats = ['CSV', 'XLSX', 'GPKG', 'SHP'];
	let format = 'CSV';

	const HREA_ID = 'HREA';
	const ML_ID = 'ML';
	const NONE_ID = 'NONE';

	let electricityChoices = [
		{ name: HREA_ID, icon: 'fas fa-plug-circle-bolt', title: 'High Resolution Electricity Access' },
		{ name: ML_ID, icon: 'fas fa-laptop-code', title: 'Machine Learning' },
		{ name: NONE_ID, icon: 'fas fa-ban', title: 'None' }
	];
	electricitySelected = electricityChoices[0];

	const download = () => {
		const url = `https://data.undpgeohub.org/admin/${layer.toLowerCase()}_polygons.${format.toLowerCase()}.zip`;
		downloadFile(url);
	};
	// Electricity Dashboard v2 -- end
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="left" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div slot="content" class="drawer-content m-0 px-4 pt-6">
		<h2 class="title is-size-6 mb-4">DASHBOARD</h2>
		<h2 class="title is-size-4 mb-5">Affordable and clean energy</h2>

		<IntroductionPanel bind:showIntro />

		{#if !showIntro}
			<div>
				<div class="a-box p-4 mb-4 {showExplore ? 'active' : ''}">
					<button
						class="a-reset a-button is-flex is-flex-wrap-wrap is-flex-direction-row is-justify-content-space-between is-align-items-flex-start {showExplore
							? 'mb-4'
							: ''}"
						type="button"
						on:click={(e) => {
							showExplore = !showExplore;
							showCompare = false;
							showAnalyse = false;
						}}
					>
						<div
							class="a-title__container is-flex is-justify-content-space-between is-align-items-center"
						>
							<img src="/assets/img/explore.svg" alt="Explore" />
							<span class="a-title"
								>Explore the evolution of electricity access at administrative level.</span
							>
						</div>
						<img src="/assets/img/information.svg" alt="Information" />
					</button>

					{#if showExplore}
						<div>
							<div class="has-background-white p-2 a-slider a-fixed">
								<TimeSlider
									bind:electricitySelected
									bind:loadLayer={loadRasterLayer}
									bind:BEFORE_LAYER_ID={POVERTY_ID}
								/>
							</div>

							<div class="p-4 has-background-light">
								<p class="mb-2">Electricity access</p>
								<div
									class="a-gradient-container is-flex is-justify-content-space-between is-flex-wrap-wrap"
								>
									<span class="a-gradient-meter mb-2"></span>
									<span>0%</span>
									<span>100%</span>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="a-box p-4 mb-4 {showCompare ? 'active' : ''}">
					<button
						class="a-reset a-button is-flex is-flex-wrap-wrap is-flex-direction-row is-justify-content-space-between is-align-items-flex-start"
						type="button"
						on:click={(e) => {
							showExplore = false;
							showCompare = !showCompare;
							showAnalyse = false;
						}}
					>
						<div
							class="a-title__container is-flex is-justify-content-space-between is-align-items-center"
						>
							<img src="/assets/img/compare.svg" alt="Compare" />
							<span class="a-title">Compare empirical with maschine learning data.</span>
						</div>
						<img src="/assets/img/information.svg" alt="Information" />
					</button>

					{#if showCompare}
						<div>
							<p>Content Later.</p>
						</div>
					{/if}
				</div>

				<div class="a-box p-4 mb-4 {showAnalyse ? 'active' : ''}">
					<button
						class="a-reset a-button is-flex is-flex-wrap-wrap is-flex-direction-row is-justify-content-space-between is-align-items-flex-start"
						type="button"
						on:click={(e) => {
							showExplore = false;
							showCompare = false;
							showAnalyse = !showAnalyse;
						}}
					>
						<div
							class="a-title__container is-flex is-justify-content-space-between is-align-items-center"
						>
							<img src="/assets/img/analyse.svg" alt="Analyse" />
							<span class="a-title"
								>Analyse bivariate data for wealth and access to electricity</span
							>
						</div>
						<img src="/assets/img/information.svg" alt="Information" />
					</button>

					{#if showAnalyse}
						<div class="a-fixed a-legend__wrapper has-background-white p-4">
							<button
								class="a-reset a-legend__button is-flex is-justify-content-space-between {showLegend
									? 'mb-4 clicked'
									: ''}"
								type="button"
								on:click={(e) => (showLegend = !showLegend)}>Legend</button
							>

							{#if showLegend}
								<div>
									<div class="is-flex is-flex-wrap-wrap is-justify-content-space-between mb-2">
										<div class="is-size-7"><strong>Wealth</strong> <br /> 100%</div>
										<div class="a-legend__container is-flex is-flex-wrap-wrap">
											<div class="a-legend__item" style="background-color: #F3618C;"></div>
											<div class="a-legend__item" style="background-color: #CE5495;"></div>
											<div class="a-legend__item" style="background-color: #A9469E;"></div>
											<div class="a-legend__item" style="background-color: #8339A6;"></div>
											<div class="a-legend__item" style="background-color: #5E2BAF;"></div>
											<div class="a-legend__item" style="background-color: #F689A9;"></div>
											<div class="a-legend__item" style="background-color: #B679A9;"></div>
											<div class="a-legend__item" style="background-color: #916CB2;"></div>
											<div class="a-legend__item" style="background-color: #6C5EBB;"></div>
											<div class="a-legend__item" style="background-color: #4750C3;"></div>
											<div class="a-legend__item" style="background-color: #F9B0C6;"></div>
											<div class="a-legend__item" style="background-color: #B9A1C6;"></div>
											<div class="a-legend__item" style="background-color: #7A91C6;"></div>
											<div class="a-legend__item" style="background-color: #5583CE;"></div>
											<div class="a-legend__item" style="background-color: #2F76D7;"></div>
											<div class="a-legend__item" style="background-color: #FCD8E2;"></div>
											<div class="a-legend__item" style="background-color: #BDC8E3;"></div>
											<div class="a-legend__item" style="background-color: #7DB8E2;"></div>
											<div class="a-legend__item" style="background-color: #3DA8E2;"></div>
											<div class="a-legend__item" style="background-color: #189BEB;"></div>

											<div
												class="a-legend__item"
												style="background-color: #FFFFFF; border: 1px solid #d4d6d8"
											></div>
											<div class="a-legend__item" style="background-color: #BFEFFF;"></div>
											<div class="a-legend__item" style="background-color: #80E0FF;"></div>
											<div class="a-legend__item" style="background-color: #40D0FF;"></div>
											<div class="a-legend__item" style="background-color: #00C0FF;"></div>
										</div>
									</div>

									<div class="is-flex is-flex-wrap-wrap is-justify-content-space-between">
										<div></div>
										<div
											class="a-legend__container is-justify-content-space-between is-flex is-flex-wrap-wrap"
										>
											<p class="is-size-7">0% <br /> <strong>Energy access</strong></p>
											<p class="is-size-7">100%</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<button class="a-reset a-full-w mt-6 a-bb-1 pb-4" type="button" on:click={download}>
					<CtaLink label="Download" isArrow />
				</button>
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

		&-fixed {
			position: fixed;
			z-index: 9;
		}

		&-slider {
			width: 300px;
			top: 165px;
			left: 367px;
			border-radius: 4px;
			box-shadow: 2px 2px 2px 0 #7d7d7d;
		}

		&-gradient {
			&-meter {
				display: block;
				width: 100%;
				height: 24px;
				border: 1px solid #d4d6d8;
				background-color: #006eb5;
				background-image: linear-gradient(to right, #fff, #006eb5);
			}
		}

		&-bb-1 {
			border-bottom: 1px solid #e1e3e5;
		}

		&-full-w {
			width: 100%;
		}

		&-legend {
			&__wrapper {
				width: 300px;
				top: 165px;
				left: 367px;
				border-radius: 4px;
				box-shadow: 2px 2px 2px 0 #7d7d7d;
			}

			&__container {
				width: calc(100% - 65px);
			}

			&__item {
				width: 39px;
				height: 39px;
				margin: 0.5px;
				background-color: #f9f9f9;
			}

			&__button {
				width: 100%;
				cursor: pointer;

				&:after {
					content: '\f077';
					font-family: 'Font Awesome 5 Free';
					font-weight: 900;
				}

				&.clicked:after {
					content: '\f078';
					font-family: 'Font Awesome 5 Free';
					font-weight: 900;
				}
			}
		}
	}
</style>
