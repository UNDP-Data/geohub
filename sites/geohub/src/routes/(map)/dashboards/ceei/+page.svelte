<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		addProtocol
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import LayerControl from './components/LayerControl.svelte';
	import type { Layer } from './stores';
	import { layers as layerStore, map as mapStore } from './stores';
	import { loadInitial } from './utils/layerHelper';
	import { Slider } from '../../../../../../../packages/svelte-undp-components/dist/components';

	let drawerWidth = '355px';
	let map: Map;
	let mapContainer: HTMLDivElement;
	let styles = MapStyles;

	let sliders = [
		{ id: 1, percentage: 100, label: 'Potential', expanded: false, locked: false },
		{ id: 2, percentage: 100, label: 'Means and Resources', expanded: false, locked: false },
		{ id: 3, percentage: 100, label: 'Urgency', expanded: false, locked: false }
	];

	const toggleExpanded = (sliderId) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		if (slider.expanded) {
			slider.expanded = false;
		} else {
			const otherSliders = sliders.filter((slider) => slider.id !== sliderId);
			otherSliders.forEach((slider) => {
				slider.expanded = false;
			});
			slider.expanded = true;
		}
		sliders = sliders;
	};

	const toggleLocked = (sliderId) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		slider.locked = !slider.locked;
		sliders = sliders;
	};

	let potentialSliders = [
		{ id: 1, percentage: 100, label: 'Solar Powered Potential', locked: false },
		{ id: 2, percentage: 100, label: 'Wind Powered Potential', locked: false }
	];

	let meansAndResourcesSliders = [
		{ id: 1, percentage: 100, label: 'Jobs in Renewable Energy', locked: false },
		{ id: 2, percentage: 100, label: 'Education', locked: false },
		{ id: 3, percentage: 100, label: 'Access to Electricity', locked: false },
		{ id: 4, percentage: 100, label: 'Public and Foreign Investment', locked: false },
		{ id: 5, percentage: 100, label: 'Barriers to Capital', locked: false },
		{ id: 6, percentage: 100, label: 'Relative Wealth', locked: false },
		{ id: 7, percentage: 100, label: 'Grid Infrastructure', locked: false }
	];

	const toggleMeansAndResourcesLocked = (sliderId) => {
		const slider = meansAndResourcesSliders.find((slider) => slider.id == sliderId);
		slider.locked = !slider.locked;
		meansAndResourcesSliders = meansAndResourcesSliders;
	};

	let urgencySliders = [
		{ id: 1, percentage: 100, label: 'GHC Emissions', locked: false },
		{ id: 2, percentage: 100, label: 'Not Electric Imports', locked: false },
		{
			id: 3,
			percentage: 100,
			label: 'Fossil Fuel Share in Total Energy Capacity/Generation',
			locked: false
		},
		{ id: 4, percentage: 100, label: 'Diversification', locked: false }
	];

	const toggleUrgencyLocked = (sliderId) => {
		const slider = urgencySliders.find((slider) => slider.id == sliderId);
		slider.locked = !slider.locked;
		urgencySliders = urgencySliders;
	};

	sliders = sliders.map((slider) => {
		slider.percentage = 100 / sliders.length;
		return slider;
	});

	potentialSliders = potentialSliders.map((slider) => {
		slider.percentage = 100 / potentialSliders.length;
		return slider;
	});

	meansAndResourcesSliders = meansAndResourcesSliders.map((slider) => {
		slider.percentage = 100 / meansAndResourcesSliders.length;
		return slider;
	});

	urgencySliders = urgencySliders.map((slider) => {
		slider.percentage = 100 / urgencySliders.length;
		return slider;
	});

	const handleSlider = (sliderId, newValue) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		const lockedSliders = sliders.filter((slider) => slider.locked);
		const lockedSlidersPercentageSum = lockedSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedSlidersPercentageSum > 0 && newValue > 100 - lockedSlidersPercentageSum) {
			newValue = 100 - lockedSlidersPercentageSum;
		}

		const currentValue = slider.percentage;
		const difference = newValue - currentValue;
		slider.percentage = newValue;

		const otherSliders = sliders.filter((slider) => slider.id !== sliderId && !slider.locked);
		const otherSlidersPercentageSum = otherSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherSliders.forEach((slider) => {
			const share =
				otherSlidersPercentageSum === 0
					? 1 / otherSliders.length
					: slider.percentage / otherSlidersPercentageSum;

			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherSliders.length) {
			slider.percentage = currentValue;
		}

		setTimeout(() => {
			sliders = [...sliders];
		}, 50);
	};

	const handlePotentialSlider = (sliderId, newValue) => {
		const slider = potentialSliders.find((slider) => slider.id == sliderId);
		const lockedSliders = potentialSliders.filter((slider) => slider.locked);
		const lockedSlidersPercentageSum = lockedSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedSlidersPercentageSum > 0 && newValue > 100 - lockedSlidersPercentageSum) {
			newValue = 100 - lockedSlidersPercentageSum;
		}

		const currentValue = slider.percentage;
		const difference = newValue - currentValue;

		slider.percentage = newValue;

		const otherSliders = potentialSliders.filter(
			(slider) => slider.id !== sliderId && !slider.locked
		);
		const otherSlidersPercentageSum = otherSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherSliders.forEach((slider) => {
			const share =
				otherSlidersPercentageSum === 0
					? 1 / otherSliders.length
					: slider.percentage / otherSlidersPercentageSum;
			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherSliders.length) {
			slider.percentage = currentValue;
		}

		setTimeout(() => {
			potentialSliders = [...potentialSliders];
		}, 50);
	};

	const handleMeansAndResourcesSlider = (sliderId, newValue) => {
		const slider = meansAndResourcesSliders.find((slider) => slider.id == sliderId);
		const lockedSliders = meansAndResourcesSliders.filter((slider) => slider.locked);
		const lockedSlidersPercentageSum = lockedSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedSlidersPercentageSum > 0 && newValue > 100 - lockedSlidersPercentageSum) {
			newValue = 100 - lockedSlidersPercentageSum;
		}
		const currentValue = slider.percentage;
		const difference = newValue - currentValue;

		slider.percentage = newValue;

		const otherSliders = meansAndResourcesSliders.filter(
			(slider) => slider.id !== sliderId && !slider.locked
		);
		const otherSlidersPercentageSum = otherSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherSliders.forEach((slider) => {
			const share =
				otherSlidersPercentageSum === 0
					? 1 / otherSliders.length
					: slider.percentage / otherSlidersPercentageSum;
			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherSliders.length) {
			slider.percentage = currentValue;
		}

		setTimeout(() => {
			meansAndResourcesSliders = [...meansAndResourcesSliders];
		}, 50);
	};

	const handleUrgencySlider = (sliderId, newValue) => {
		const slider = urgencySliders.find((slider) => slider.id == sliderId);
		const lockedSliders = urgencySliders.filter((slider) => slider.locked);
		const lockedSlidersPercentageSum = lockedSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedSlidersPercentageSum > 0 && newValue > 100 - lockedSlidersPercentageSum) {
			newValue = 100 - lockedSlidersPercentageSum;
		}
		const currentValue = slider.percentage;
		const difference = newValue - currentValue;

		slider.percentage = newValue;

		const otherSliders = urgencySliders.filter(
			(slider) => slider.id !== sliderId && !slider.locked
		);
		const otherSlidersPercentageSum = otherSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherSliders.forEach((slider) => {
			const share =
				otherSlidersPercentageSum === 0
					? 1 / otherSliders.length
					: slider.percentage / otherSlidersPercentageSum;
			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherSliders.length) {
			slider.percentage = currentValue;
		}

		setTimeout(() => {
			urgencySliders = [...urgencySliders];
		}, 50);
	};

	const headerHeightStore = createHeaderHeightStore();

	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const loadDatasets = async (): Promise<Layer> => {
		const geohubUrl = 'https://geohub.data.undp.org/api/datasets/4ac962eea9d41d3ea98d467dcc633711';

		const geohubRes = await fetch(geohubUrl);
		const dataset = await geohubRes.json();

		if (!dataset) return null;

		const metadataUrl =
			dataset.properties?.links?.find((link) => link.rel === 'metadatajson')?.href ?? null;
		const metadataRes = await fetch(metadataUrl);
		const metadata = await metadataRes.json();

		return {
			name: dataset.properties.name,
			isVisible: true,
			sourceId: dataset.properties.name + '-source',
			source: {
				type: 'vector',
				url: dataset.properties.url
			},
			layerId: dataset.properties.name + '-layer',
			layer: {
				id: dataset.properties.name + '-layer',
				type: 'fill',
				source: dataset.properties.name + '-source',
				'source-layer': metadata.json.vector_layers[0].id,
				layout: {},
				paint: {
					'fill-color': ['interpolate', ['linear'], ['get', 'CEEI'], 0, '#c598ff', 1, '#006eb5'],
					'fill-opacity': 0.4
				}
			},
			bounds: metadata.bounds.split(','),
			isMapLoaded: false,
			isDataLoaded: false
		};
	};

	let showSimulateModal = false;

	const openSimulateModal = () => {
		showSimulateModal = true;
	};

	const closeSimulateModal = () => {
		showSimulateModal = false;
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
		map.getCanvas().style.cursor = 'pointer';

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
		map.addControl(styleSwitcher, 'bottom-left');

		map.on('load', () => {
			map.resize();

			styleSwitcher.initialise();
		});

		mapStore.update(() => map);

		const initialLayer = await loadDatasets();
		loadInitial(initialLayer);
	});
</script>

<div class="modal {showSimulateModal ? 'is-active' : ''}" style="z-index: 100000">
	<div class="modal-background" role="dialog"></div>
	<div class="modal-content has-background-white p-4" style="width: 400px">
		<button
			class="close-simulate-modal delete is-white is-medium mb-4"
			aria-label="close"
			on:click={closeSimulateModal}
		></button>
		<h1 class="title">Simulate</h1>

		<div style="background: #ededed; padding: 12px 0 12px 0;">
			{#each sliders as { id, percentage, label, expanded, locked }}
				<div style="margin: auto;">
					<div class="slider-field">
						<div class="label">
							<button
								on:click={() => {
									toggleExpanded(id);
								}}
							>
								<span class="icon is-small">
									{#if !expanded}
										<i class="fa-solid fa-caret-down"></i>
									{:else}
										<i class="fa-solid fa-caret-left"></i>
									{/if}
								</span>
								{label}
							</button>
						</div>
						<div class="value">
							{percentage.toFixed(2)}
							<button on:click={() => toggleLocked(id)}>
								<span class="icon is-small">
									{#if locked}
										<i class="fa-solid fa-lock"></i>
									{:else}
										<i class="fa-solid fa-unlock"></i>
									{/if}
								</span>
							</button>
						</div>
					</div>
					<Slider
						values={[percentage]}
						min={0}
						max={100}
						step={0.01}
						first="label"
						last="label"
						rest={false}
						pips={false}
						formatter={(value) => value.toFixed(2)}
						disabled={locked}
						on:change={(event) => {
							let newValue = 0;
							if (event?.detail?.values[0]) {
								newValue = event?.detail?.values[0];
							}
							handleSlider(id, newValue);
						}}
					/>

					{#if id === 1 && expanded}
						<div style="background: #F7F7F7; padding: 8px 0 8px 24px;">
							{#each potentialSliders as { id, percentage, label, locked }}
								<div style="margin: auto;">
									<div class="slider-field-sm">
										<div class="label">{label}</div>
										<div class="value">{percentage.toFixed(2)}</div>
									</div>
									<Slider
										values={[percentage]}
										min={0}
										max={100}
										step={0.01}
										first="label"
										last="label"
										rest={false}
										pips={false}
										formatter={(value) => value.toFixed(2)}
										disabled={locked}
										on:change={(event) => {
											let newValue = 0;
											if (event?.detail?.values[0]) {
												newValue = event?.detail?.values[0];
											}
											handlePotentialSlider(id, newValue);
										}}
									/>
								</div>
							{/each}
						</div>
					{:else if id === 2 && expanded}
						<div style="background: #F7F7F7; padding: 8px 0 8px 24px;">
							{#each meansAndResourcesSliders as { id, percentage, label, locked }}
								<div style="margin: auto;">
									<div class="slider-field-sm">
										<div class="label">{label}</div>
										<div class="value">
											{percentage.toFixed(2)}
											<button on:click={() => toggleMeansAndResourcesLocked(id)}>
												<span class="icon is-small">
													{#if locked}
														<i class="fa-solid fa-lock"></i>
													{:else}
														<i class="fa-solid fa-unlock"></i>
													{/if}
												</span>
											</button>
										</div>
									</div>
									<Slider
										values={[percentage]}
										min={0}
										max={100}
										step={0.01}
										first="label"
										last="label"
										rest={false}
										pips={false}
										formatter={(value) => value.toFixed(2)}
										disabled={locked}
										on:change={(event) => {
											let newValue = 0;
											if (event?.detail?.values[0]) {
												newValue = event?.detail?.values[0];
											}
											handleMeansAndResourcesSlider(id, newValue);
										}}
									/>
								</div>
							{/each}
						</div>
					{:else if id === 3 && expanded}
						<div style="background: #F7F7F7; padding: 8px 0 8px 24px;">
							{#each urgencySliders as { id, percentage, label, locked }}
								<div style="margin: auto;">
									<div class="slider-field-sm">
										<div class="label" style="max-width: 260px">{label}</div>
										<div class="value">
											{percentage.toFixed(2)}
											<button on:click={() => toggleUrgencyLocked(id)}>
												<span class="icon is-small">
													{#if locked}
														<i class="fa-solid fa-lock"></i>
													{:else}
														<i class="fa-solid fa-unlock"></i>
													{/if}
												</span>
											</button>
										</div>
									</div>
									<Slider
										values={[percentage]}
										min={0}
										max={100}
										step={0.01}
										first="label"
										last="label"
										rest={false}
										pips={false}
										formatter={(value) => value.toFixed(2)}
										disabled={locked}
										on:change={(event) => {
											let newValue = 0;
											if (event?.detail?.values[0]) {
												newValue = event?.detail?.values[0];
											}
											handleUrgencySlider(id, newValue);
										}}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<Header isPositionFixed={true} />

<Sidebar show={true} position="right" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div
		slot="content"
		class="drawer-content m-0 px-4 pt-6 is-flex is-flex-direction-column is-gap-1"
	>
		<div class="is-flex is-flex-direction-column is-gap-1">
			{#each $layerStore as l, i}
				<div>
					<LayerControl layerDetails={l} index={i} on:simulate={openSimulateModal} />
				</div>
			{/each}
		</div>
	</div>
	<div slot="main">
		<div class="map" id="map" bind:this={mapContainer} />
	</div>
</Sidebar>

<style lang="scss">
	.slider-field {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px 0;
		.label {
			padding-top: 4px;
			button {
				font-size: 16px;
				font-weight: 600;
			}
		}
	}

	.slider-field-sm {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px;
		font-size: 12px;
		.label {
			font-size: 14px;
			padding-top: 4px;
		}
	}
	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	.close-simulate-modal {
		position: absolute;
		right: 12px;
		top: 12px;
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
</style>
