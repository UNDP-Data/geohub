<script lang="ts">
	import { page } from '$app/stores';
	import LayerVisibilitySwitcher from '$components/pages/map/plugins/LayerVisibilitySwitcher.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
	import StyleShareControl from '$components/pages/map/plugins/StyleShareControl.svelte';
	import { AdminControlOptions, MapStyles, TourOptions, attribution } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getSpriteImageList,
		isStyleChanged,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { Layer, VectorLayerSpecification } from '$lib/types';
	import {
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		PROGRESS_BAR_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		createProgressBarStore,
		type EditingMenuShownStore,
		type LayerListStore,
		type MapStore,
		type PageDataLoadingStore,
		type ProgressBarStore,
		type SpriteImageStore
	} from '$stores';
	import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl';
	import '@maptiler/geocoding-control/style.css';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import {
		MaplibreStaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import type { TourGuideOptions } from '@watergis/svelte-maplibre-tour';
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

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);
	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	let tourOptions: TourGuideOptions;
	let tourLocalStorageKey = `geohub-map-${$page.url.host}`;

	let container: HTMLDivElement;
	let styleSwitcher: MaplibreStyleSwitcherControl;

	export let defaultStyle: string = MapStyles[0].title;
	let styleUrl = MapStyles[0].uri;

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

	let exportOptions: ControlOptions = {
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
	};

	onMount(() => {
		retrieveExistingMapStyle().then(mapInitialise);
	});

	const retrieveExistingMapStyle = async () => {
		const style = $page.data.style;
		if (style) {
			// /map/{id} page

			styleUrl = style.links.find((l) => l.rel === 'stylejson').href;

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
						if (l2?.activeTab !== l.activeTab) {
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
		$map.setMaxPitch(85);
		$map.addControl(new TerrainControl(terrainOptions), 'bottom-right');

		$map.on('styledata', () => {
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

		$map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');

		styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {
			defaultStyle: defaultStyle
		});
		$map.addControl(styleSwitcher, 'bottom-left');

		$map.on('load', mapInitializeAfterLoading);
	};

	const mapInitializeAfterLoading = async () => {
		$map.resize();
		await styleSwitcher.initialise();

		const spriteUrl = $map.getStyle().sprite as string;
		const iconList = await getSpriteImageList(spriteUrl);
		spriteImageList.update(() => iconList);

		const { MaplibreTourControl } = await import('@watergis/maplibre-gl-tour');

		tourOptions = TourOptions;
		$map.addControl(
			new MaplibreTourControl(tourOptions, {
				localStorageKey: tourLocalStorageKey
			}),
			'top-right'
		);

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

<div bind:this={container} class="map">
	{#if $showProgressBarStore}
		<progress class="progress is-small is-primary is-link is-radiusless"></progress>
	{/if}
</div>

{#if $map}
	<MapQueryInfoControl bind:map={$map} layerList={layerListStore} position="top-right" />
	<StyleShareControl bind:map={$map} layerList={layerListStore} position="top-right" />
	<LayerVisibilitySwitcher bind:map={$map} position="bottom-right" />
	<MaplibreStaticImageControl
		bind:map={$map}
		show={false}
		style={styleUrl}
		apiBase={$page.data.staticApiUrl}
		bind:options={exportOptions}
		position="top-right"
	/>
{/if}

{#if $editingMenuShownStore}
	<LayerEdit />
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	@import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	@import '@sjmc11/tourguidejs/dist/css/tour.min.css';
	@import '@watergis/maplibre-gl-tour/dist/maplibre-tour-control.css';

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
