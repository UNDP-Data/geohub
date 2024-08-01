<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import { Loader, Select } from '@undp-data/svelte-undp-design';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		Popup,
		ScaleControl,
		addProtocol
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import pako from 'pako';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import * as topojson from 'topojson-client';
	import { read, utils } from 'xlsx';
	import LayerControl from './components/LayerControl.svelte';
	import {
		layers as layerStore,
		map as mapStore,
		mapPopup as popupStore,
		type Layer
	} from './stores';
	import { getPaintExpression, headerMapping, loadInitial } from './utils/layerHelper';

	let drawerWidth = '355px';
	let map: Map;
	let mapContainer: HTMLDivElement;
	let styles = MapStyles;
	let countriesList: { label: string; value: string }[];
	let popup: Popup;

	const headerHeightStore = createHeaderHeightStore();

	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const loadDatasets = async (): Promise<Layer> => {
		const ceeiTopojsonGzipUrl = 'https://undpgeohub.blob.core.windows.net/ceei/ceei.topojson.gz';
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

		const ceeiDataUrl = 'https://undpgeohub.blob.core.windows.net/ceei/original/raw_data_ceei.xlsx';
		const ceeiDataXlsxRes = fetch(ceeiDataUrl).then((res) => res.arrayBuffer());

		const countriesUrl = 'https://geohub.data.undp.org/api/countries';
		const countriesRes = fetch(countriesUrl).then((res) => res.json());

		const ceeiDataXlsx = await ceeiDataXlsxRes;
		const ceeiWorkbook = read(ceeiDataXlsx);
		let ceeiData = utils.sheet_to_json(ceeiWorkbook.Sheets[ceeiWorkbook.SheetNames[0]]);

		const countries = await countriesRes;
		countriesList = countries
			.filter((c) => c.continent_name === 'Africa')
			.map((c) => {
				return {
					label: c.country_name,
					value: c.country_name
				};
			});
		countriesList.unshift({
			label: 'All',
			value: 'All'
		});
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
			newRow['CEEI'] = Math.random(); // TEMP VALUE UNTIL CEEI IS COMPUTED
			return newRow;
		});

		const defaultColorMap = 'rdylbu';

		const { ceeiJson, ceeiMapBbox } = await ceeiTopojsonGzipRes;
		return {
			name: 'Base Layer',
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
					'fill-color': getPaintExpression({
						colorMap: defaultColorMap,
						groupCount: 10,
						min: 0,
						max: 1,
						feature: ['get', 'CEEI'],
						mode: 'step'
					}),
					'fill-opacity': 0.7
				}
			},
			isMapLoaded: false,
			isDataLoaded: false,
			data: ceeiData as object[],
			colorMap: defaultColorMap
		};
	};

	const handleCountryFilter = (e) => {
		const selectedItem = e.detail.item.value;
		if (selectedItem === 'All') {
			$layerStore.forEach((l) => {
				map.setFilter(l.layerId, undefined);
			});
		} else {
			$layerStore.forEach((l) => {
				map.setFilter(l.layerId, ['==', 'Country', selectedItem]);
			});
		}
	};

	onMount(async () => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

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

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
		map.addControl(styleSwitcher, 'bottom-left');

		popup = new Popup({
			closeButton: false,
			closeOnClick: false,
			maxWidth: 'none'
		});
		popupStore.set(popup);

		map.on('load', () => {
			map.resize();

			styleSwitcher.initialise();

			loadDatasets().then(async (initialLayer) => {
				loadInitial(initialLayer);
			});
		});

		mapStore.update(() => map);
	});
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="left" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div
		slot="content"
		class="drawer-content m-0 px-4 pt-6 is-flex is-flex-direction-column is-gap-1"
	>
		<div class="is-flex is-flex-direction-column is-gap-1">
			{#if $layerStore.length === 0}
				<div
					class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
				>
					<Loader />
					<div>Loading data...</div>
				</div>
			{:else}
				<Select
					items={countriesList}
					placeholder="Filter by country"
					on:selected={handleCountryFilter}
				/>
				{#each $layerStore as l, i}
					<div>
						<LayerControl layerDetails={l} index={i} />
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div slot="main">
		<div class="toast-wrapper">
			<SvelteToast />
		</div>
		<div class="map" bind:this={mapContainer} />
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

	.toast-wrapper {
		max-height: 300px;
	}
</style>
