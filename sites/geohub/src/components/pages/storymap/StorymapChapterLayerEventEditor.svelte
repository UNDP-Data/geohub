<script lang="ts">
	import type { DashboardMapStyle } from '$lib/types';
	import { layerTypes, type StoryMapChapterLayerEvent } from '@undp-data/svelte-maplibre-storymap';
	import { Slider } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	const dipatch = createEventDispatcher();

	export let style: string | StyleSpecification;
	export let styleId: number;
	export let chapterLayerEvent: StoryMapChapterLayerEvent[];

	const toggleId = uuidv4();

	let styleJson: StyleSpecification;
	let geohubStyle: DashboardMapStyle;

	let requireUpdated = false;
	let showOnlyGeoHubLayers = true;

	const getLayerOpacity = (layerId: string) => {
		const layer = styleJson.layers.find((l) => l.id === layerId);
		if (!layer) return;

		if (layer.layout?.visibility === 'none') {
			return 0;
		}

		let opacity = 1;

		const props: string[] = layerTypes[layer.type];
		if (!(props && props.length > 0)) return opacity;

		for (const prop of props) {
			const v = layer.paint[prop];
			if (!v) continue;
			opacity = v;
			break;
		}

		return opacity;
	};

	onMount(() => {
		initialize();
	});

	const initialize = async () => {
		geohubStyle = await fetchGeoHubStyle();
		styleJson = await fetchStyle();
	};

	const fetchStyle = async () => {
		if (typeof style === 'string') {
			const res = await fetch(style);
			let json: StyleSpecification = await res.json();
			json = applyLayerEvent(json);
			return json;
		} else {
			style = applyLayerEvent(style);
			return style;
		}
	};

	const fetchGeoHubStyle = async () => {
		if (!styleId) return;
		const res = await fetch(`/api/style/${styleId}`);
		const json: DashboardMapStyle = await res.json();
		return json;
	};

	const getLayerName = (layerId: string) => {
		if (!geohubStyle) return layerId;
		const geohubLayer = geohubStyle.layers.find((l) => l.id === layerId);
		if (!geohubLayer) return layerId;
		return geohubLayer.name;
	};

	const isGeoHubLayer = (layerId: string) => {
		if (!geohubStyle) return false;
		const geohubLayer = geohubStyle.layers.find((l) => l.id === layerId);
		return geohubLayer ? true : false;
	};

	const applyLayerEvent = (json: StyleSpecification) => {
		for (let i = 0; i < json.layers.length; i++) {
			const l = json.layers[i];
			const layerEvent = chapterLayerEvent?.find((e) => e.layer === l.id);
			if (layerEvent) {
				if (layerEvent.opacity === 0) {
					l.layout.visibility = 'none';
				} else {
					l.layout.visibility = 'visible';
				}
			}
		}
		return json;
	};

	const updateChangeLayerVisibility = (layerId: string, newOpacity: number) => {
		if (!chapterLayerEvent) {
			chapterLayerEvent = [];
		}

		const layerEvent: StoryMapChapterLayerEvent = {
			layer: layerId,
			opacity: newOpacity,
			duration: 300
		};

		const index = chapterLayerEvent.findIndex((e) => e.layer === layerId);
		if (index === -1) {
			chapterLayerEvent = [...chapterLayerEvent, layerEvent];
		} else {
			chapterLayerEvent[index] = layerEvent;
			chapterLayerEvent = [...chapterLayerEvent];
		}
	};

	const handleLayerVisibilityChanged = (layer: LayerSpecification) => {
		const currentOpacity = getLayerOpacity(layer.id);

		const newOpacity = currentOpacity === 0 ? 1 : 0;

		for (const l of styleJson.layers) {
			if (l.id !== layer.id) continue;

			l.layout.visibility = newOpacity === 1 ? 'visible' : 'none';
			const props: string[] = layerTypes[l.type];
			if (props && props.length > 0) {
				for (const prop of props) {
					l.paint[prop] = newOpacity;
				}
			}
			updateChangeLayerVisibility(l.id, newOpacity);
			break;
		}
		requireUpdated = !requireUpdated;
		dipatch('change');
	};

	const handleSlideChanged = debounce((values: number[], layer: LayerSpecification) => {
		const opacity = values[0] / 100;
		updateChangeLayerVisibility(layer.id, opacity);
		dipatch('change');
	}, 300);
</script>

{#if !styleJson}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:else}
	<nav class="is-flex is-flex-direction-column">
		<div>
			<input
				id="hide-baselayer-{toggleId}"
				type="checkbox"
				class="switch"
				bind:checked={showOnlyGeoHubLayers}
			/>
			<label class="pb-1" for="hide-baselayer-{toggleId}">Show only GeoHub layers</label>
		</div>

		<table class="table is-striped is-narrow is-hoverable is-fullwidth layer-panel">
			<tbody>
				{#key requireUpdated}
					{#each styleJson.layers as layer}
						{@const opacity = getLayerOpacity(layer.id)}
						{@const isGeoHub = isGeoHubLayer(layer.id)}
						{#if !showOnlyGeoHubLayers || (showOnlyGeoHubLayers && isGeoHub)}
							<tr>
								<td>
									<div class="is-flex is-flex-direction-column">
										<label class="is-flex is-align-items-center py-2">
											<button
												class="panel-icon"
												on:click={() => {
													handleLayerVisibilityChanged(layer);
												}}
											>
												{#if opacity === 0}
													<i class="fas fa-eye-slash" aria-hidden="true"></i>
												{:else}
													<i class="fas fa-eye" aria-hidden="true"></i>
												{/if}
											</button>
											{getLayerName(layer.id)}
										</label>
										<div class="opacity-control" hidden={getLayerOpacity(layer.id) === 0}>
											<Slider
												min={0}
												max={100}
												values={[getLayerOpacity(layer.id) * 100]}
												step={1}
												rest={false}
												pips={true}
												suffix="%"
												on:change={(e) => {
													const values = e.detail.values;
													handleSlideChanged(values, layer);
												}}
											/>
											<span class="opacity-label is-size-7">Opacity</span>
										</div>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				{/key}
			</tbody>
		</table>
	</nav>
{/if}

<style lang="scss">
	.layer-panel {
		max-height: 300px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.opacity-control {
		position: relative;

		.opacity-label {
			position: absolute;
			bottom: 5px;
			left: 50%;
			transform: translateX(-50%);
			-webkit-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
		}
	}
</style>
