<script lang="ts">
	import { page } from '$app/stores';
	import LayerVisibilitySwitcher from '$components/pages/map/plugins/LayerVisibilitySwitcher.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
	import SplitControl from '$components/util/SplitControl.svelte';
	import { AdminControlOptions, MapStyles, attribution } from '$lib/config/AppConfig';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { IntroJsOptions, Layer, VectorLayerSpecification } from '$lib/types';
	import {
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		HEADER_HEIGHT_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		PROGRESS_BAR_CONTEXT_KEY,
		SIDEBAR_MENU_SHOWN_CONTEXT_KEY,
		SIDEBAR_WIDTH_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		createProgressBarStore,
		type EditingMenuShownStore,
		type HeaderHeightStore,
		type LayerListStore,
		type PageDataLoadingStore,
		type ProgressBarStore,
		type SidebarWidthStore
	} from '$stores';
	import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl';
	import '@maptiler/geocoding-control/style.css';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '@undp-data/svelte-undp-components';
	import { SkyControl } from '@watergis/maplibre-gl-sky';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		TerrainControl,
		type MapOptions,
		type RasterLayerSpecification,
		type StyleSpecification,
		type TerrainSpecification
	} from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';
	import LayerEdit from './layers/LayerEdit.svelte';
	import VectorTable from './layers/vector/VectorTable.svelte';
	import TourControl from './plugins/TourControl.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);
	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	const sidebarWidthStore: SidebarWidthStore = getContext(SIDEBAR_WIDTH_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);
	const sidebarMenuShownStore: EditingMenuShownStore = getContext(SIDEBAR_MENU_SHOWN_CONTEXT_KEY);

	let windowWidth = 0;
	let windowHeight = 0;
	let mapHeight = 0;
	$: mapWidth = windowWidth - ($sidebarMenuShownStore === true ? $sidebarWidthStore : 0);
	$: splitHeight = windowHeight - $headerHeightStore;
	$: tableHeight = windowHeight - $headerHeightStore - mapHeight;

	let container: HTMLDivElement;
	let styleSwitcher: MaplibreStyleSwitcherControl;

	export let defaultStyle: string = MapStyles[0].title;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();
	const showProgressBarStore: ProgressBarStore = createProgressBarStore();
	$showProgressBarStore = false;
	setContext(PROGRESS_BAR_CONTEXT_KEY, showProgressBarStore);
	showProgressBarStore.subscribe((state) => {
		if (!$map) return;
		$map.getCanvas().style.cursor = state === true ? 'wait' : '';
	});

	const terrainOptions: TerrainSpecification = {
		source: 'terrarium',
		exaggeration: 1
	};

	let mapOptions: MapOptions = {
		container: undefined,
		style: $page.data.defaultStyle,
		center: [0, 0],
		zoom: 3,
		hash: true,
		attributionControl: false
	};

	let tourOptions: IntroJsOptions = {
		showAsDefault: true,
		dontShowAgain: true,
		dontShowAgainCookie: 'geohub-map-introjs-dontShowAgain',
		steps: [
			{
				title: 'Welcome to UNDP GeoHub!',
				intro: `This tutorial is going to take you around the main features of GeoHub map editor to get you on board. <br> Let's begin!`,
				position: 'floating',
				step: 1,
				scrollTo: 'off'
			},
			{
				title: 'Sign in',
				intro: `If you have an account in UNDP, please sign in to your account from here. So, you will have full functionalities on GeoHub!
            <br>Please continue next step if you are not UNDP staff.`,
				element: '.signin-button',
				position: 'bottom',
				step: 2,
				scrollTo: 'off'
			},
			{
				title: 'Explore datasets',
				intro: `You can explore datasets from <b>Data</b> tab. Let's start looking how you can search the datasets!`,
				element: '.tab-data',
				position: 'bottom',
				step: 3,
				scrollTo: 'off'
			},
			{
				title: 'Explore by shortcuts',
				intro: `
            You can find datasets from the shortcuts' menu.
            <br><br>
            <b>SDG</b>: You can search datasets by Sustainable Development Goal (SDG)
            <br>
            <b>Continent</b>: You can search datasets from continent > selected country
            <br>
            Note. Currently, most of our datasets are global data, that means you may be able to find less data if you explore by a country.
            <br>
            <b>Microsoft Planetary</b>: Satellite imagery powered by Microsoft Planetary Computer is also available from this shortcut menu.
            <br>
            <b>Dynamic vector data</b>: The datasets under this category enables you to dynamically change the parameters to simulate the datasets for advanced analysis.
            <br>
            <b>Organisations</b>: If you click a logo of institution like UNDP, UNICEF, etc., you can find datasets come from that organisation.
            `,
				element: '.tab-data',
				position: 'right',
				step: 3,
				scrollTo: 'off'
			},
			{
				title: 'Search datasets by keywords',
				intro: `You can search datasets by typing keywords in this searching window. The results will be shown at the below of searching window. Open a accordion of a dataset to find more detailed metadata, then add the dataset to the map for further analysis`,
				element: '.tab-data',
				position: 'bottom',
				step: 1,
				scrollTo: 'off'
			},
			{
				title: 'Switch to Layers tab',
				intro: `
            Once you add a dataset to the map, you can switch it to <b>Layers</b> tab to see other menu to style and analyse the dataset.
            <br>
            This layer panel provides you full functionality of visualing and analysing the dataset. If you want to edit styling of a layer, click a palette icon to open editing panel at the opposite side of sidebar.
            `,
				element: '.tab-layers',
				position: 'bottom',
				step: 4,
				scrollTo: 'off'
			},
			{
				title: 'Map operations',
				intro: `
            From this step, we are going to show you main operations on the map.
            `,
				element: '.map',
				position: 'floating',
				step: 5,
				scrollTo: 'off'
			},
			{
				title: 'Switching basemap',
				intro: `
            You can toggle this button to switch basemap either OpenStreetMap or Bing Aerial
            `,
				element: '.maplibregl-style-switcher-control',
				position: 'top',
				step: 6,
				scrollTo: 'off'
			},
			{
				title: 'Show/hide sidebar',
				intro: `
            You can show or hide sidebar container by toggling this button.
            `,
				element: '.toggle-button',
				position: 'right',
				step: 7,
				scrollTo: 'off'
			},
			{
				title: 'Querying the information',
				intro: `
            If this tool is enabled, you can query the information by clicking any position on the map. A popup will be shown for further detailed information.
            `,
				element: '.maplibregl-ctrl-query',
				position: 'left',
				step: 8,
				scrollTo: 'off'
			},
			{
				title: 'Exporting map image',
				intro: `
            You can export the current map image with your preferences such as paper size, orientation, file format, etc.
            `,
				element: '.legend-button',
				position: 'left',
				step: 9,
				scrollTo: 'off'
			},
			{
				title: 'Disable hillshade layer',
				intro: `
            As default, a hillshade layer is shown on the basemap. You can also disable hillshade layer if you want.
            `,
				element: '.maplibregl-ctrl-hillshade-visibility',
				position: 'left',
				step: 10,
				scrollTo: 'off'
			},
			{
				title: 'Positioning your current location',
				intro: `
            Your current location will be visible on the map if you enable this GNSS control.
            `,
				element: '.maplibregl-ctrl-geolocate',
				position: 'left',
				step: 11,
				scrollTo: 'off'
			},
			{
				title: 'Tour completed!',
				intro:
					'You have completed map editor tour. Now you can start exploring GeoHub to create a beautiful map. You can always come back to the tour by clicking this button',
				element: '.tour-control-button',
				position: 'left',
				step: 12,
				scrollTo: 'off'
			}
		]
	};

	onMount(() => {
		retrieveExistingMapStyle().then(mapInitialise);
	});

	const retrieveExistingMapStyle = async () => {
		const style = $page.data.style;
		if (style) {
			// /map/{id} page

			// if style query param in URL
			if (`${initiaMapStyleId}` === `${style.id}`) {
				// If style id in local storage is the same with style query param
				if (isStyleChanged(initiaMapStyle, style.style)) {
					// restore from local storage

					// to make sure dataset links exist, otherwise restore from database
					let linksNotExist = true;
					initialLayerList.forEach((l) => {
						if (l.dataset.properties.links) {
							linksNotExist = false;
						}
					});
					if (!linksNotExist) {
						const nonExistLayers: Layer[] = [];
						for (const l of initialLayerList) {
							const id = l.dataset.properties.id;
							const stacType = l.dataset.properties.tags.find((t) => t.key === 'stacType')?.value;
							if (['cog', 'mosaicjson'].includes(stacType)) continue;
							if (!initiaMapStyle.layers.find((l) => l.id === id)) continue;
							const datasetUrl = `${$page.url.origin}/api/datasets/${id}`;
							const res = await fetch(datasetUrl);
							if (res.ok) {
								l.dataset = await res.json();
							} else {
								nonExistLayers.push(l);
							}
						}
						// only accept if dataset metadata is fetched
						if (nonExistLayers.length > 0) {
							nonExistLayers.forEach((layer) => {
								initialLayerList.splice(initialLayerList.findIndex((l) => l.id === layer.id));
								initiaMapStyle.layers.splice(
									initiaMapStyle.layers.findIndex((l) => l.id === layer.id)
								);
							});
						}
						restoreStyle(initiaMapStyle, initialLayerList);
						toLocalStorage(mapStyleStorageKey, initiaMapStyle);
						toLocalStorage(layerListStorageKey, initialLayerList);
					} else {
						restoreStyle(style.style, style.layers);
					}
				} else {
					initialLayerList?.forEach((l) => {
						const l2 = style.layers.find((x) => x.id === l.id);
						if (l2?.activeTab && l2.activeTab !== l.activeTab) {
							l2.activeTab = l.activeTab;
						}
					});

					// restore from database
					restoreStyle(style.style, style.layers);
				}
			} else {
				// style ID is different from query param
				restoreStyle(style.style, style.layers);
				toLocalStorage(mapStyleIdStorageKey, style.id);
			}
		} else {
			// /map page

			if (initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
				let existAllLayers = true;
				initialLayerList.forEach((l) => {
					if (!initiaMapStyle.layers.find((ml) => ml.id === l.id)) {
						existAllLayers = false;
					}
				});
				if (existAllLayers) {
					// restore from local storage

					// to make sure dataset links exist, otherwise remove all local storage
					let linksNotExist = true;
					initialLayerList.forEach((l) => {
						if (l.dataset.properties.links) {
							linksNotExist = false;
						}
					});
					if (!linksNotExist) {
						const nonExistLayers: Layer[] = [];
						for (const l of initialLayerList) {
							const id = l.dataset.properties.id;
							const stacType = l.dataset.properties.tags.find((t) => t.key === 'stacType')?.value;
							if (['cog', 'mosaicjson', 'collection'].includes(stacType)) continue;
							const datasetUrl = `${$page.url.origin}/api/datasets/${id}`;
							const res = await fetch(datasetUrl);
							if (res.ok) {
								l.dataset = await res.json();
							} else {
								nonExistLayers.push(l);
							}
						}
						// only accept if dataset metadata is fetched
						if (nonExistLayers.length > 0) {
							nonExistLayers.forEach((layer) => {
								initialLayerList.splice(initialLayerList.findIndex((l) => l.id === layer.id));
								initiaMapStyle.layers.splice(
									initiaMapStyle.layers.findIndex((l) => l.id === layer.id)
								);
							});
						}

						// if there is no layer using source, delete them.
						Object.keys(initiaMapStyle.sources).forEach((src) => {
							const layers = initiaMapStyle.layers.filter(
								(l: RasterLayerSpecification | VectorLayerSpecification) => l.source === src
							);
							if (layers.length === 0) {
								delete initiaMapStyle.sources[src];
							}
						});
						restoreStyle(initiaMapStyle, initialLayerList);
					} else {
						toLocalStorage(layerListStorageKey, []);
						toLocalStorage(mapStyleStorageKey, $page.data.defaultStyle);
					}
				} else {
					toLocalStorage(layerListStorageKey, []);
					toLocalStorage(mapStyleStorageKey, $page.data.defaultStyle);
				}
			} else {
				toLocalStorage(layerListStorageKey, []);
				toLocalStorage(mapStyleStorageKey, $page.data.defaultStyle);
			}
		}
	};

	const mapInitialise = () => {
		mapOptions.container = container;
		$map = new Map(mapOptions);

		$map.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		$map.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		$map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		$map.addControl(new TerrainControl(terrainOptions), 'bottom-right');

		$map.on('styledata', () => {
			const sky = new SkyControl();
			sky.addTo($map, { timeType: 'solarNoon' });
			const isTerrain = $map.getTerrain();
			if (isTerrain) {
				$map.setTerrain(null);
			}
			if (isTerrain) {
				setTimeout(() => {
					$map.setTerrain(terrainOptions);
				}, 500);
			}
		});

		$map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		const apiKey = $page.data.maptilerKey;
		if (apiKey) {
			const gc = new GeocodingControl({
				apiKey: apiKey,
				marker: true,
				showFullGeometry: false,
				showResultsWhileTyping: false,
				collapsed: false
			});
			$map.addControl(gc, 'top-left');
		}

		const adminOptions = AdminControlOptions;
		adminOptions.isHover = false;
		$map.addControl(new MaplibreCgazAdminControl(adminOptions), 'top-left');

		styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {
			defaultStyle: defaultStyle
		});
		$map.addControl(styleSwitcher, 'bottom-left');

		$map.on('load', mapInitializeAfterLoading);
	};

	const mapInitializeAfterLoading = async () => {
		$map.resize();
		await styleSwitcher.initialise();

		layerListStore.subscribe((value) => {
			const layerList: Layer[] | null = fromLocalStorage(layerListStorageKey, []);
			const storageValue = value ? value : layerList && layerList.length > 0 ? layerList : null;
			toLocalStorage(layerListStorageKey, storageValue);
		});

		map.subscribe((value) => {
			let storageValue = value ? value.getStyle() : null;
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
		$pageDataLoadingStore = false;
		$map.on('dataloading', () => {
			$showProgressBarStore = true;
		});
		$map.on('data', () => {
			$showProgressBarStore = false;
		});
		$map.on('sourcedataloading', () => {
			$showProgressBarStore = true;
		});
		$map.on('sourcedata', () => {
			$showProgressBarStore = false;
		});
		$map.on('styledataloading', () => {
			$showProgressBarStore = true;
		});
		$map.on('styledata', async () => {
			$showProgressBarStore = false;
			let storageValue = $map.getStyle();
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
		$map.off('load', mapInitializeAfterLoading);
	};

	const restoreStyle = (newStyle: StyleSpecification, newLayerList: Layer[]) => {
		mapOptions.style = newStyle;

		if (newStyle.center) {
			mapOptions.center = [newStyle.center[0], newStyle.center[1]];
		}
		if (newStyle.zoom) {
			mapOptions.zoom = newStyle.zoom;
		}

		if (newStyle.bearing) {
			mapOptions.bearing = newStyle.bearing;
		}

		if (newStyle.pitch) {
			mapOptions.pitch = newStyle.pitch;
		}

		$layerListStore = [...newLayerList];
		toLocalStorage(layerListStorageKey, newLayerList);
		toLocalStorage(mapStyleStorageKey, newStyle);
	};
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<SplitControl
	sidebarOnLeft={false}
	isHorizontal={true}
	bind:isMenuShown={$tableMenuShownStore}
	minMapWidth="30%"
	minSidebarWidth="10px"
	initialSidebarWidth={500}
	bind:height={splitHeight}
	bind:width={mapWidth}
>
	<div slot="map">
		<div
			bind:this={container}
			class="map"
			style="width: {mapWidth}px;"
			bind:clientHeight={mapHeight}
		>
			{#if $showProgressBarStore}
				<progress class="progress is-small is-primary is-link is-radiusless"></progress>
			{/if}

			{#if $editingMenuShownStore}
				<LayerEdit />
			{/if}
		</div>
	</div>
	<div slot="sidebar">
		<div style="width: {mapWidth}px; height: {tableHeight}px;">
			<VectorTable bind:height={tableHeight} />
		</div>
	</div>
</SplitControl>

{#if $map}
	<MapQueryInfoControl bind:map={$map} layerList={layerListStore} position="top-right" />
	<LayerVisibilitySwitcher bind:map={$map} position="bottom-right" />
	<TourControl bind:map={$map} position="top-right" bind:options={tourOptions} />
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	@import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	:global(button.tg-dialog-btn) {
		cursor: pointer;
	}
	.progress {
		position: absolute;
		z-index: 10;
	}
</style>
