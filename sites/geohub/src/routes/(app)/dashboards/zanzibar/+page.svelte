<script lang="ts">
	import { attribution, MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import MaplibreGeocoder, {
		type MaplibreGeocoderApiConfig,
		type MaplibreGeocoderFeatureResults
	} from '@maplibre/maplibre-gl-geocoder';
	import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { MaplibreLegendControl } from '@undp-data/svelte-maplibre-storymap';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import maplibregl, {
		addProtocol,
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		TerrainControl,
		type TerrainSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
	import { getContext, onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let windowHeight = 0;
	$: mapHeight = windowHeight - $headerHeightStore;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let styleSwitcher: MaplibreStyleSwitcherControl;

	let geocoderData: MaplibreGeocoderFeatureResults;

	const terrainOptions: TerrainSpecification = {
		source: 'terrarium',
		exaggeration: 1
	};

	const mapInitializeAfterLoading = async () => {
		map.resize();
		await styleSwitcher.initialise();
		const sky = new SkyControl();
		sky.addTo(map, { timeType: 'solarNoon' });
		const isTerrain = map.getTerrain();
		if (isTerrain) {
			map.setTerrain(null);
		}
		if (isTerrain) {
			setTimeout(() => {
				map.setTerrain(terrainOptions);
			}, 500);
		}
	};

	const getAttributeData = async (fgbLink: string) => {
		const fc: MaplibreGeocoderFeatureResults = {
			type: 'FeatureCollection',
			features: []
		};

		const formData = new FormData();
		formData.append('fgb', fgbLink);

		const res = await fetch('/dashboards/zanzibar?/geocoder_data', {
			method: 'POST',
			body: formData
		});
		const json = await res.json();
		const data = JSON.parse(json.data);
		const features = JSON.parse(data[0]);
		fc.features = features.features;
		return fc;
	};

	onMount(() => {
		let protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);

		map = new Map({
			container: mapContainer,
			style: data.style.style,
			// center: [0, 0],
			// zoom: 3,
			hash: true,
			maxPitch: 85,
			attributionControl: false
		});

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
		map.addControl(new TerrainControl(terrainOptions), 'bottom-right');

		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {
			defaultStyle: MapStyles[0].title
		});
		map.addControl(styleSwitcher, 'bottom-left');

		if (data.style.layers && data.style.layers.length > 0) {
			const firstDataset = data.style.layers[0].dataset;
			const fgbLink = firstDataset?.properties.links?.find((l) => l.rel === 'flatgeobuf')?.href;
			if (fgbLink) {
				getAttributeData(fgbLink).then((fc) => {
					geocoderData = fc;
				});

				const geocoder_api = {
					forwardGeocode: async (config: MaplibreGeocoderApiConfig) => {
						if (!geocoderData) return;
						const fc: MaplibreGeocoderFeatureResults = {
							type: 'FeatureCollection',
							features: []
						};
						const query = config.query as string;
						for (const feature of geocoderData.features) {
							if (query.length > 0) {
								const props = feature.properties as { [key: string]: number | string };
								let isMatched = false;
								for (const key of Object.keys(props)) {
									const value = props[key];
									if (typeof value === 'string') {
										if (value.toLowerCase().indexOf(query) !== -1) {
											isMatched = true;
											break;
										}
									} else if (typeof value === 'number') {
										if (`${value}` === query) {
											isMatched = true;
											break;
										}
									}
								}
								if (!isMatched) continue;
								fc.features.push(feature);
							}
						}

						return fc;
					}
				};

				const geocoder = new MaplibreGeocoder(geocoder_api, {
					zoom: 12,
					placeholder: 'Search attractions',
					limit: 10,
					maplibregl: maplibregl,
					collapsed: false,
					showResultsWhileTyping: true
				});
				map.addControl(geocoder, 'top-left');
			}
		}

		map.once('styledata', mapInitializeAfterLoading);
	});
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div bind:this={mapContainer} class="map" style="height: {mapHeight}px;">
	{#if map}
		<MaplibreLegendControl
			bind:map
			bind:styleId={data.style.id}
			position="bottom-left"
			showInteractive={false}
			showInvisibleLayers={false}
		/>
	{/if}
</div>

<style lang="scss">
	.map {
		position: relative;
		width: 100%;
	}
</style>
