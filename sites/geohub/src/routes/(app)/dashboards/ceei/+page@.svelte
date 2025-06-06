<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import Header from '$components/header/Header.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import '@maptiler/geocoding-control/style.css';
	import { bbox } from '@turf/bbox';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { createMapStore, MAPSTORE_CONTEXT_KEY, Sidebar } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { FeatureCollection } from 'geojson';
	import { uniq } from 'lodash-es';
	import {
		addProtocol,
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		Popup,
		ScaleControl,
		type LngLatBoundsLike
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import pako from 'pako';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import * as topojson from 'topojson-client';
	import { read, utils } from 'xlsx';
	import type { PageData } from './$types';
	import DropdownSearch from './components/DropdownSearch.svelte';
	import LayerControl from './components/LayerControl.svelte';
	import { layers as layerStore, mapPopup as popupStore, type Layer } from './stores';
	import { computeCEEI, headerMapping, loadInitial } from './utils/layerHelper';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let drawerWidth = $state(355);
	let map: Map = $state();
	let mapContainer: HTMLDivElement = $state();
	let popup: Popup = $state();
	let styles = MapStyles;

	let baseCeeiJson: FeatureCollection = $state();
	let fullCountries = $state();
	let countriesList: { label: string; value: string }[] = $state();
	let selectedCountryFilter: string | null = $state(null);

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	const loadDatasets = async (): Promise<Layer> => {
		const ceeiTopojsonGzipUrl = `${data.azureUrl}/ceei/ceei.topojson.gz`;
		const ceeiTopojsonGzipRes = fetch(ceeiTopojsonGzipUrl)
			.then((res) => res.arrayBuffer())
			.then((buff) => {
				const ceeiTopojson = JSON.parse(
					pako.ungzip(buff, {
						to: 'string'
					})
				);

				return {
					ceeiJson: topojson.feature(ceeiTopojson, ceeiTopojson.objects.admin2),
					ceeiMapBbox: topojson.bbox(ceeiTopojson)
				};
			});

		const ceeiDataUrl = `${data.azureUrl}/ceei/original/raw_data_ceei.xlsx`;
		const ceeiDataXlsxRes = fetch(ceeiDataUrl).then((res) => res.arrayBuffer());

		const countriesRes = fetch('/api/countries').then((res) => res.json());

		const ceeiDataXlsx = await ceeiDataXlsxRes;
		const ceeiWorkbook = read(ceeiDataXlsx);
		let ceeiData = utils.sheet_to_json(ceeiWorkbook.Sheets[ceeiWorkbook.SheetNames[0]]);

		const countries = await countriesRes;
		fullCountries = countries;

		ceeiData = ceeiData.map((d) => {
			const newRow = {};

			Object.keys(d).forEach((k) => {
				const newHeader = headerMapping[k];
				if (newHeader) {
					newRow[newHeader] = d[k];
				}
			});

			const { country_name } = countries.find((c) => c.iso_3 === d.iso3_country_code);
			newRow['Country'] = country_name;
			return newRow;
		});
		countriesList = uniq(ceeiData.map((cd) => cd['Country']))
			.sort()
			.map((c) => {
				return {
					label: c,
					value: c
				};
			});

		const defaultColorMap = 'rdylbu';

		const { ceeiJson, ceeiMapBbox } = await ceeiTopojsonGzipRes;
		baseCeeiJson = ceeiJson;
		return {
			name: 'Clean Energy Equity Index',
			isVisible: true,
			sourceId: 'CEEI' + '-source',
			bounds: ceeiMapBbox,
			source: {
				type: 'geojson',
				data: ceeiJson,
				promoteId: 'adminid'
			},
			layerId: 'CEEI' + '-layer',
			layer: {
				id: 'CEEI' + '-layer',
				type: 'fill',
				source: 'CEEI' + '-source',
				layout: {
					visibility: 'visible'
				},
				paint: {
					'fill-outline-color': '#000000'
				}
			},
			isMapLoaded: false,
			isDataLoaded: false,
			data: computeCEEI(ceeiData, null) as object[],
			colorMap: defaultColorMap
		};
	};

	$effect(() => {
		let filter =
			selectedCountryFilter === null ? undefined : ['==', 'Country', selectedCountryFilter];
		$layerStore.forEach((l) => {
			if (map.getLayer(l.layerId)) {
				map.setFilter(l.layerId, filter);
			}
		});
		if (popup && popup.isOpen()) {
			popup.remove();
		}
		if (map) {
			map.dragPan.disable();
			if (selectedCountryFilter !== null) {
				let filteredFeatures = baseCeeiJson.features.filter(
					(f) =>
						f.properties.iso3_country_code ===
						fullCountries.find((c) => c.country_name === selectedCountryFilter).iso_3
				);
				let filteredCeeiJson = {
					...baseCeeiJson,
					features: filteredFeatures
				};

				const filteredBbox = bbox(filteredCeeiJson) as LngLatBoundsLike;
				map.fitBounds(filteredBbox, { padding: 50 });
				map.dragPan.enable();
			} else {
				if (map.getMaxBounds()) {
					map.fitBounds(map.getMaxBounds());
					map.dragPan.enable();
				}
			}
		}
	});

	onMount(async () => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

		map = new Map({
			container: mapContainer,
			style: styles[0].uri,
			center: [0, 0],
			zoom: 2.5,
			hash: true,
			attributionControl: false,
			dragPan: false,
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
		map.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
		map.addControl(
			new AttributionControl({ compact: true, customAttribution: data.attribution }),
			'bottom-right'
		);

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

		popup = new Popup({
			closeButton: true,
			closeOnClick: false,
			maxWidth: 'none'
		});
		popupStore.set(popup);

		map.on('load', () => {
			map.resize();

			styleSwitcher.initialise();

			loadDatasets().then(async (initialLayer) => {
				map.once('sourcedata', (e) => {
					const waiting = () => {
						if (e.sourceId === initialLayer.sourceId && e.isSourceLoaded) {
							map.fitBounds(initialLayer.bounds, { padding: 50 });
							map.once('zoomend', () => {
								map.setMaxBounds(map.getBounds());
								map.dragPan.enable();
							});
						} else {
							setTimeout(waiting, 200);
						}
					};
					waiting();
				});
				loadInitial(map, initialLayer);
			});
		});

		mapStore.update(() => map);
	});
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
		<div class="drawer-content m-0 px-4 pb-4 is-flex is-flex-direction-column is-gap-1">
			<div class="is-flex is-flex-direction-column is-gap-1">
				{#if $layerStore.length === 0}
					<div
						class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
					>
						<Loader />
						<div>Loading data...</div>
					</div>
				{:else}
					<div class="field is-fullwidth">
						<h2 class="title is-size-6 mt-4 mb-4">DASHBOARD</h2>
						<h2 class="title is-size-4 mb-5">CEEI Dashboard</h2>
						<p>
							<b
								>Developed with IBM through the <a
									href="https://www.ibm.com/impact/initiatives/ibm-sustainability-accelerator"
									>IBM Sustainability Accelerator</a
								></b
							>
						</p>
						<label class="label mt-4" for="country-filter">Filter map to a country</label>
						<div class="is-fullwidth">
							<DropdownSearch
								items={countriesList}
								select={(item) => {
									selectedCountryFilter = item?.value ?? null;
								}}
							></DropdownSearch>
						</div>
					</div>

					{#each $layerStore as l, i (l.layerId)}
						<div>
							<LayerControl bind:layerDetails={$layerStore[i]} index={i} />
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet main()}
		<div>
			<div class="toast-wrapper">
				<SvelteToast />
			</div>
			<div class="map" bind:this={mapContainer}></div>
		</div>
	{/snippet}
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

	.toast-wrapper {
		max-height: 300px;
	}
</style>
