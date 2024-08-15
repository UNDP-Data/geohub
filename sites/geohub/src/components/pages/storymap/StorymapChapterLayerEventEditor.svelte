<script lang="ts">
	import OpacityEditor from '$components/util/OpacityEditor.svelte';
	import type { DashboardMapStyle } from '$lib/types';
	import { layerTypes, type StoryMapChapterLayerEvent } from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Loader, Switch } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const tippyTooltip = initTooltipTippy();
	const dipatch = createEventDispatcher();

	export let style: string | StyleSpecification;
	export let styleId: number;
	export let chapterLayerEvent: StoryMapChapterLayerEvent[];

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

	const handleOpacityChanged = debounce((values: number, layer: LayerSpecification) => {
		const opacity = values;
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
		<FieldControl title="Show only GeoHub layers" showHelp={false}>
			<div slot="control">
				<Switch bind:toggled={showOnlyGeoHubLayers} />
			</div>
		</FieldControl>

		<table class="table is-striped is-narrow is-hoverable is-fullwidth layer-panel">
			<tbody>
				{#key requireUpdated}
					{#each styleJson.layers as layer}
						{@const isGeoHub = isGeoHubLayer(layer.id)}
						{#if !showOnlyGeoHubLayers || (showOnlyGeoHubLayers && isGeoHub)}
							{@const layerName = getLayerName(layer.id)}
							<tr>
								<td class="mx-1">
									<div class="layer-row is-flex is-align-items-center py-2">
										{#if layerName.length < 29}
											<span class="layername">
												{layerName}
											</span>
										{:else}
											<span class="layername" use:tippyTooltip={{ content: layerName }}>
												{layerName}
											</span>
										{/if}

										<div class="ml-auto is-flex is-align-items-center">
											<OpacityEditor
												opacity={getLayerOpacity(layer.id)}
												on:change={(e) => {
													const opacity = e.detail.opacity;
													handleOpacityChanged(opacity, layer);
												}}
											/>
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

		.layer-row {
			position: relative;

			.layername {
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				max-width: 240px;

				// :hover {
				// 	white-space: normal;
				// 	position: absolute;
				// 	top: 0;
				// 	z-index: 20;
				// }
			}
		}
	}
</style>
