<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from '$components/header/Header.svelte';
	import LayerVisibilitySwitcher from '$components/pages/map/plugins/LayerVisibilitySwitcher.svelte';
	import MaplibreLocationSwitchControl from '$components/pages/map/plugins/MaplibreLocationSwitchControl.svelte';
	import TourControl from '$components/pages/map/plugins/TourControl.svelte';
	import { attribution, MapStyles } from '$lib/config/AppConfig';
	import type { IntroJsOptions } from '$lib/types';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import MaplibreGeocoder, {
		type MaplibreGeocoderApiConfig,
		type MaplibreGeocoderFeatureResults
	} from '@maplibre/maplibre-gl-geocoder';
	import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import {
		MaplibreStaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import { MaplibreLegendControl } from '@undp-data/svelte-maplibre-storymap';
	import {
		Breadcrumbs,
		FieldControl,
		handleEnterKey,
		HeroLink,
		ModalTemplate,
		Tabs,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { Button, Footer } from '@undp-data/svelte-undp-design';
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
		type RasterLayerSpecification,
		type RasterSourceSpecification,
		type StyleSpecification,
		type TerrainSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import Carousel from 'svelte-carousel';
	import type { PageData } from './$types';

	export let data: PageData;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);
	let windowHeight = 0;
	let windowWidth = 0;
	let crowdmappingHeight = 0;
	$: mapHeight = windowHeight - $headerHeightStore;
	$: isMobile = windowWidth < 768;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'dashboards', url: '/dashboards' },
		{ title: data.content, url: $page.url.href }
	];

	const OAM_LAYERID = 'openaerialmap';
	let mapContainer: HTMLDivElement;
	let map: Map;
	let styleSwitcher: MaplibreStyleSwitcherControl;
	let scrollSnapParent: HTMLDivElement;

	let geocoderData: MaplibreGeocoderFeatureResults;

	let clickedFeatures: MapGeoJSONFeature[] = [];
	let showDialog = false;
	let selectedTab: string;
	let dialogTitle = '';

	const terrainOptions: TerrainSpecification = {
		source: 'terrarium',
		exaggeration: 1
	};

	let tourControlInstance: TourControl | undefined = undefined;
	let tourOptions: IntroJsOptions | undefined = undefined;

	let styleUrl = MapStyles[0].uri;
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
						if (clickedFeatures.length > 0) {
							openModal();
							expanded = { photos: true };
							selectedTab = `${clickedFeatures[0].id}`;
						} else {
							closeModal();
						}
					}
					dialogTitle = getDialogTitle();
				});

				map.on('mouseenter', id, () => {
					map.getCanvas().style.cursor = 'crosshair';
				});

				map.on('mouseleave', id, () => {
					map.getCanvas().style.cursor = '';
				});
			}
		}

		tourOptions = {
			showAsDefault: false,
			scrollToElement: false,
			dontShowAgain: true,
			dontShowAgainCookie: 'geohub-zanzibar-introjs-dontShowAgain',
			steps: [
				{
					title: 'Welcome to Zanzibar!',
					intro: `This tutorial is going to take you around the main features of Zanzibar tourism dashboard to get you on board. <br> Let's begin!`,
					position: 'floating',
					step: 1,
					scrollTo: 'off'
				},
				{
					title: 'Searching tourism sites',
					intro: 'Type any keywords here to search siteseeing spots in islands!',
					element: scrollSnapParent.querySelector('.maplibregl-ctrl-geocoder') as HTMLElement,
					position: 'bottom',
					step: 2,
					scrollTo: 'off'
				},
				{
					title: 'Zoom to a location',
					intro: 'Select a place to zoom in on the map!',
					element: scrollSnapParent.querySelector('.location-switch-control') as HTMLElement,
					position: 'bottom',
					step: 3,
					scrollTo: 'off'
				},
				{
					title: 'Find my location',
					intro: 'Turn GPS on your device to find your location on the map!',
					element: scrollSnapParent.querySelector('.maplibregl-ctrl-geolocate') as HTMLElement,
					position: 'left',
					step: 4,
					scrollTo: 'off'
				},
				{
					title: 'Enable aerial image',
					intro:
						'Toggle this button to enable or diable high resolution aerial photos caputered by Zanzibar Mapping Initialitve from OpenAerialMap',
					element: scrollSnapParent.querySelector(
						'.maplibregl-ctrl-openaerialmap-visibility'
					) as HTMLElement,
					position: 'left',
					step: 5,
					scrollTo: 'off'
				},
				{
					title: 'Export map image',
					intro: 'You can export a map image in various formats and sizes by clicking this button',
					element: scrollSnapParent.querySelector('.legend-button') as HTMLElement,
					position: 'left',
					step: 6,
					scrollTo: 'off'
				},
				{
					title: 'Switch to other base maps',
					intro: 'You can switch to different base map from the default one.',
					element: scrollSnapParent.querySelector(
						'.maplibregl-style-switcher-control'
					) as HTMLElement,
					position: 'top',
					step: 6,
					scrollTo: 'off'
				}
			]
		};

		if (!isMobile) {
			tourOptions.steps.push({
				title: 'Map legend',
				intro: 'Legend for each map layer can be seen here.',
				element: '.maplibre-ctrl-legend',
				position: 'top',
				step: tourOptions.steps.length + 1,
				scrollTo: 'off'
			});
		}

		tourOptions.steps.push({
			title: 'Tour completed!',
			intro:
				'Now you can start exploring Zanzibar to find beautiful spots! You can always come back to the tour by clicking this button',
			element: '.tour-control-button',
			position: 'left',
			step: tourOptions.steps.length + 1,
			scrollTo: 'off'
		});
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

	const getPhotoUrls = (feature: MapGeoJSONFeature) => {
		const keys = Object.keys(feature.properties).filter((k) => {
			const match = k.toLowerCase().match(/^picture \d+ link$/);
			if (match) {
				const pictureKey = k.replace('link', '').trim(); // `picture N` を取得
				return feature.properties[pictureKey] && feature.properties[pictureKey].length > 0;
			}
			return false;
		});
		const urls = keys.map((k) => feature.properties[k]);
		return urls;
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

	const openModal = () => {
		showDialog = true;
	};

	const closeModal = () => {
		showDialog = false;
	};

	const addOpenAerialMap = (style: StyleSpecification) => {
		const source: RasterSourceSpecification = {
			type: 'raster',
			tiles: ['https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png'],
			attribution: `<a href="https://map.openaerialmap.org">OpenAerialMap</a>, <a href="https://www.kontur.io/">Kontur</a>`,
			minzoom: 0,
			maxzoom: 18
		};

		if (!style.sources[OAM_LAYERID]) {
			style.sources[OAM_LAYERID] = source;
		}

		if (style.layers.find((l) => l.id === OAM_LAYERID)) return;

		const layer: RasterLayerSpecification = {
			id: OAM_LAYERID,
			type: 'raster',
			source: OAM_LAYERID,
			layout: {
				visibility: 'none'
			}
		};

		const geohubLayerIds = data.style.layers?.map((l) => l.id) ?? [];
		const firstGeoHubLayerIndex = style.layers.findIndex((l) => geohubLayerIds.includes(l.id));
		if (firstGeoHubLayerIndex === -1) {
			style.layers.push(layer);
		} else {
			style.layers.splice(firstGeoHubLayerIndex, 1, layer);
		}
	};

	onMount(() => {
		const protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);

		addOpenAerialMap(data.style.style as StyleSpecification);

		styleUrl = data.style.links?.find((l) => l.rel === 'stylejson')?.href as string;

		map = new Map({
			container: mapContainer,
			style: data.style.style,
			center: data.center,
			zoom: data.zoom,
			hash: true,
			maxPitch: 85,
			maxZoom: 18,
			maxBounds: data.maxExtent,
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
					showResultsWhileTyping: true,
					showResultMarkers: true
				});
				map.addControl(geocoder, 'top-left');
			}
		}

		map.once('styledata', mapInitializeAfterLoading);
	});

	afterNavigate(() => {
		scrollTo('hero', scrollSnapParent, 'instant');
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

	const handleExploreClicked = () => {
		scrollTo('zanzibar-map', scrollSnapParent);
		if (map) {
			map.flyTo({ center: data.center, zoom: data.zoom });
		}
		if (tourControlInstance) {
			tourControlInstance.start(true);
		}
	};

	const scrollTo = (
		hash: string,
		parentElement?: HTMLElement,
		behavior: 'auto' | 'instant' | 'smooth' = 'smooth'
	) => {
		if (browser) {
			const anchor = document.getElementById(hash);
			if (anchor) {
				if (parentElement) {
					parentElement.scrollTo({
						top: anchor.offsetTop,
						behavior: behavior
					});
				} else {
					window.scrollTo({
						top: anchor.offsetTop - 110,
						behavior: behavior
					});
				}
			}
		}
	};
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<svelte:head>
	<style>
		body {
			overflow: hidden;
		}
	</style>
</svelte:head>

<Header isPositionFixed={true} />

<div
	class="scroll-snap-parent"
	style="height: {mapHeight}px; margin-top: {$headerHeightStore}px"
	bind:this={scrollSnapParent}
>
	<div class="hero background section-item" id="hero" style="height: {mapHeight}px;">
		<div class="breadcrumbs-overlay">
			<Breadcrumbs pages={breadcrumbs} />
		</div>
		<div class="title-overlay has-text-white">
			<h1 class="title is-1 has-text-white">Welcome to Zanzibar</h1>
			<p class="is-size-3 pb-4">
				Explore the beauty of Zanzibar and experience its rich culture and heritage.
			</p>
			<div class="explore-button">
				<Button title="Explore Zanzibar" on:clicked={handleExploreClicked} isArrow={true} />
			</div>
		</div>

		<div class="scroll-down-arrow">
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				role="button"
				tabindex="0"
				on:click={handleExploreClicked}
				on:keydown={handleEnterKey}
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off"
			>
				<span class="icon has-text-white"><i class="fa-solid fa-angle-down fa-4x"></i></span>
			</a>
		</div>
	</div>

	<div
		bind:this={mapContainer}
		id="zanzibar-map"
		class="map section-item"
		style="height: {mapHeight}px;"
	>
		{#if map}
			<MaplibreLocationSwitchControl bind:map position="top-right" bind:places={data.places} />
			<LayerVisibilitySwitcher
				bind:map
				position="bottom-right"
				target={OAM_LAYERID}
				icon="satellite"
			/>

			<MaplibreStaticImageControl
				bind:map
				show={false}
				style={styleUrl}
				apiBase={$page.data.staticApiUrl}
				bind:options={exportOptions}
				hiddenApiTypes={true}
				position="bottom-right"
			/>

			{#if tourOptions}
				<TourControl
					bind:map
					position="bottom-right"
					bind:options={tourOptions}
					bind:this={tourControlInstance}
				/>
			{/if}
			{#if !isMobile}
				<MaplibreLegendControl
					bind:map
					bind:styleId={data.style.id}
					position="bottom-left"
					showInteractive={false}
					showInvisibleLayers={false}
				/>
			{/if}
		{/if}

		<div class="scroll-down-arrow">
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				role="button"
				tabindex="0"
				on:click={() => {
					scrollTo('footer-section', scrollSnapParent);
				}}
				on:keydown={handleEnterKey}
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off"
			>
				<span class="icon has-text-grey"><i class="fa-solid fa-angle-down fa-4x"></i></span>
			</a>
		</div>
	</div>

	<section
		id="footer-section"
		class="crowd-mapping section-item-start"
		style="height: {crowdmappingHeight}px;"
	>
		<div bind:clientHeight={crowdmappingHeight}>
			<HeroLink title="Crowd Mapping for tourism" linkName="Read more" href={data.blogUrl}>
				The UNDP Accelerator Lab collaborated with OpenMap Development Tanzania and the State
				University of Zanzibar's youth mappers chapter to map unpopular tourist attractions with the
				goal of assessing the existing situation through crowd mapping and mobile surveys prior to
				creating this web map.
			</HeroLink>

			<Footer
				logoUrl="/assets/undp-images/undp-logo-white.svg"
				bind:footerItems={data.footerLinks}
			/>
		</div>
	</section>
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
						{#if browser}
							{@const images = getPhotoUrls(f)}
							{#if images.length > 0}
								<Carousel
									autoplay
									autoplayDuration={1000 * images.length}
									autoplayProgressVisible
									arrows={true}
								>
									{#each images as imageSrc}
										<img src={imageSrc} alt={f.properties.name} class="photo" loading="eager" />
									{/each}
								</Carousel>
							{/if}
						{/if}

						{#if f.properties['short history']}
							{f.properties['short history']}
						{/if}
					</div>
				</FieldControl>

				<FieldControl title="Touristic Information" showHelp={false} fontWeight="bold">
					<div slot="control">
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
				</FieldControl>
			</div>
		{/each}
	</div>
</ModalTemplate>

<style lang="scss">
	.scroll-snap-parent {
		overflow: auto;
		scroll-snap-type: y mandatory;

		.section-item {
			scroll-snap-align: end;
		}

		.section-item-start {
			scroll-snap-align: start;
		}
	}

	.hero {
		&.background {
			position: relative;
			width: 100%;
			height: 100vh;
			background-image: url('https://www.undp.org/sites/g/files/zskgke326/files/2022-07/Zanzibar%20tourism.jpg');
			background-size: cover;
			background-position: center;
			display: flex;
			justify-content: center;
			align-items: center;

			.breadcrumbs-overlay {
				position: absolute;
				top: 100px;
				left: 77px;

				@media (max-width: 48em) {
					top: 48px;
					left: 16px;
				}
			}
			.title-overlay {
				position: absolute;
				left: 77px;
				width: 500px;

				@media (max-width: 48em) {
					left: 16px;
					width: 350px;
				}

				.explore-button {
					width: 300px;
				}
			}
		}
	}

	.map {
		position: relative;
		width: 100%;
	}

	.dialog-contents {
		max-height: 500px;
		overflow-y: auto;

		.photo {
			border: 1px solid #d4d6d8;
			object-fit: contain;
			max-height: 350px;
		}
	}

	.crowd-mapping {
		:global(.hero) {
			margin-top: 0 !important;
		}
	}

	.scroll-down-arrow {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
		cursor: pointer;
		z-index: 10;

		a {
			padding-top: 70px;

			span {
				position: absolute;
				bottom: 15px;
				left: 50%;
				width: 24px;
				height: 24px;
				margin-left: -12px;
				-webkit-animation: sdb05 1.5s infinite;
				animation: sdb05 1.5s infinite;
				box-sizing: border-box;

				@-webkit-keyframes sdb05 {
					0% {
						-webkit-transform: translate(0, 0);
						opacity: 0;
					}
					50% {
						opacity: 1;
					}
					100% {
						-webkit-transform: translate(0, 20px);
						opacity: 0;
					}
				}
				@keyframes sdb05 {
					0% {
						transform: translate(0, 0);
						opacity: 0;
					}
					50% {
						opacity: 1;
					}
					100% {
						transform: translate(0, 20px);
						opacity: 0;
					}
				}
			}
		}
	}
</style>
