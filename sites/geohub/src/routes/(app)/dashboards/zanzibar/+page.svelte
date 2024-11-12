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
	import { Accordion, FieldControl, ModalTemplate, Tabs } from '@undp-data/svelte-undp-components';
	import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import dayjs from 'dayjs';
	import maplibregl, {
		addProtocol,
		AttributionControl,
		GeolocateControl,
		Map,
		MapMouseEvent,
		NavigationControl,
		ScaleControl,
		TerrainControl,
		type MapGeoJSONFeature,
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

	let clickedFeatures: MapGeoJSONFeature[] = [];
	let showDialog = false;
	let selectedTab: string;
	let dialogTitle = '';

	const terrainOptions: TerrainSpecification = {
		source: 'terrarium',
		exaggeration: 1
	};

	const getTabs = () => {
		const tabs = clickedFeatures.map((f) => {
			return { label: f.properties.name as string, id: `${f.id}` };
		});
		return tabs;
	};

	const getDialogTitle = () => {
		if (clickedFeatures.length === 0) {
			return 'Tourism information';
		}
		const names = clickedFeatures.map((f) => f.properties.name);
		return `${names[0]}${names.length > 1 ? `, etc` : ''}`;
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

		const MaplibreExportControl = (await import('@watergis/maplibre-gl-export'))
			.MaplibreExportControl;
		const exportControl = new MaplibreExportControl({
			PageSize: [297, 210],
			PageOrientation: 'landscape',
			Format: 'png',
			DPI: 96,
			Crosshair: true,
			PrintableArea: true,
			Local: 'en'
		});
		map.addControl(exportControl, 'top-right');

		if (data.style.layers) {
			const layerIds = data.style.layers.map((l) => l.id);
			for (const id of layerIds) {
				map.on('click', id, (e: MapMouseEvent) => {
					const visibleLayers = map.getStyle().layers.filter((l) => {
						let visibility = 'visible';
						if (l.layout && l.layout.visibility) {
							visibility = l.layout.visibility;
						}
						return visibility === 'visible';
					});
					const visibleLayerIds = visibleLayers.map((l) => l.id);
					const layersVisible = layerIds.filter((id) => visibleLayerIds.includes(id));
					expanded = {};
					if (layersVisible.length > 0) {
						clickedFeatures = map.queryRenderedFeatures(e.point, {
							layers: layersVisible
						});
						showDialog = clickedFeatures.length > 0;
						if (clickedFeatures.length > 0) {
							expanded = { photos: true };
							selectedTab = `${clickedFeatures[0].id}`;
						}
					}
					dialogTitle = getDialogTitle();
				});
			}
		}
	};

	const getFeatureData = (feature: MapGeoJSONFeature) => {
		return {
			// 'Site name': feature.properties.name,
			'Tourism type': feature.properties['type tourism'],
			uniqueness: feature.properties['uniqueness'],
			// 'short history': feature.properties['short history'],
			'social economic activity': feature.properties['social economic activity'],
			'Types tourist attraction': feature.properties['Types tourist attraction'],
			'tourist activities': feature.properties['tourist activities'],
			'Site Functionality Status':
				feature.properties['Site Functionality Status'] === true ? 'functional' : 'non functional',
			'custom tradition': feature.properties['custom tradtion yes'],
			'surrounded services': feature.properties['surrounded services yes'],
			'Site address': [
				feature.properties['addr ward'],
				feature.properties['addr street'],
				feature.properties['add region'],
				feature.properties['addr district']
			]
				.filter((v) => v !== undefined)
				.join(', '),
			accesibility: feature.properties['accesibility'],
			direction: feature.properties['direction'],
			'submittion time': dayjs(feature.properties['submission time']).format(
				'HH:mm:ss, MMMM D, YYYY'
			)
		} as { [key: string]: string };
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

		styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
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

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedId: string;
	$: {
		let expandedData = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedData.length > 0) {
			expandedId = expandedData[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedData[0]] = true;
		}
	}
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

<ModalTemplate bind:title={dialogTitle} bind:show={showDialog}>
	<div slot="content" class="dialog-contents">
		{#if clickedFeatures.length > 1}
			<Tabs
				tabs={getTabs()}
				bind:activeTab={selectedTab}
				fontWeight="bold"
				isBoxed={false}
				isFullwidth={false}
				isCentered={false}
				isUppercase={true}
			></Tabs>
		{/if}
		{#each clickedFeatures as f}
			{@const contents = getFeatureData(f)}
			<div hidden={`${f.id}` !== selectedTab}>
				<FieldControl title={f.properties.name} showHelp={false} fontWeight="bold">
					<div slot="control">
						{f.properties['short history']}
					</div>
				</FieldControl>
				<Accordion title="Photos" bind:isExpanded={expanded['photos']} padding="px-0">
					<div slot="content">Coming soon</div>
				</Accordion>
				<Accordion title="Metadata" bind:isExpanded={expanded['metadata']} padding="px-0">
					<div slot="content">
						<table class="table is-narrow is-hoverable is-fullwidth">
							<tbody>
								{#each Object.keys(contents) as key}
									{#if contents[key] && contents[key].length > 0}
										<tr>
											<th><p class="is-capitalized">{key}</p></th>
											<td><p class="is-capitalized">{contents[key]}</p></td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					</div>
				</Accordion>
			</div>
		{/each}
	</div>
</ModalTemplate>

<style lang="scss">
	.map {
		position: relative;
		width: 100%;
	}

	.dialog-contents {
		max-height: 500px;
		overflow-y: auto;
	}
</style>
