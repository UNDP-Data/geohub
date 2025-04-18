<script lang="ts">
	import type { DashboardMapStyle } from '$lib/types';
	import { ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY, type ActiveStorymapChapterStore } from '$stores';
	import { layerTypes, type StoryMapChapterLayerEvent } from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, initTooltipTippy, OpacityEditor } from '@undp-data/svelte-undp-components';
	import { Loader, Switch } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const tippyTooltip = initTooltipTippy();

	interface Props {
		chapterLayerEvent?: 'onChapterEnter' | 'onChapterExit';
		onchange?: () => void;
	}

	let { chapterLayerEvent = 'onChapterEnter', onchange = () => {} }: Props = $props();

	const activeChapterStore: ActiveStorymapChapterStore = getContext(
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY
	);

	let styleJson: StyleSpecification | undefined = $state();
	let geohubStyle: DashboardMapStyle | undefined;

	let requireUpdated = false;
	let showOnlyGeoHubLayers = $state(true);

	const getLayerOpacity = (layerId: string) => {
		if (!styleJson) return;
		const layer = styleJson.layers.find((l) => l.id === layerId);
		if (!layer) return;

		if (layer.layout?.visibility === 'none') {
			return 0;
		}

		if (layer.type === 'hillshade') {
			return 1;
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

	const isShowOpacity = (layerId: string) => {
		const layer = styleJson?.layers?.find((l) => l.id === layerId);
		if (!layer) return false;

		return layer.type === 'hillshade' ? false : true;
	};

	onMount(() => {
		initialize();
	});

	const initialize = async () => {
		geohubStyle = await fetchGeoHubStyle();
		styleJson = await fetchStyle();
	};

	const fetchStyle = async () => {
		if (!$activeChapterStore) return;
		if (typeof $activeChapterStore.style === 'string') {
			const res = await fetch($activeChapterStore.style);
			let json: StyleSpecification = await res.json();
			json = applyLayerEvent(json) as StyleSpecification;
			return json;
		} else {
			$activeChapterStore.style = applyLayerEvent($activeChapterStore.style);
			return $activeChapterStore.style;
		}
	};

	const fetchGeoHubStyle = async () => {
		if (!$activeChapterStore) return;
		if (!$activeChapterStore.style_id) return;
		const res = await fetch(`/api/style/${$activeChapterStore.style_id}`);
		const json: DashboardMapStyle = await res.json();
		return json;
	};

	const getLayerName = (layerId: string) => {
		if (!geohubStyle) return layerId;
		const geohubLayer = geohubStyle.layers?.find((l) => l.id === layerId);
		if (!geohubLayer) return layerId;
		return geohubLayer.name;
	};

	const isGeoHubLayer = (layerId: string) => {
		if (!geohubStyle) return false;
		const geohubLayer = geohubStyle.layers?.find((l) => l.id === layerId);
		return geohubLayer ? true : false;
	};

	const applyLayerEvent = (json: StyleSpecification) => {
		if (!$activeChapterStore) return;
		for (let i = 0; i < json.layers.length; i++) {
			const l = json.layers[i];
			const layerEvent = $activeChapterStore[chapterLayerEvent]?.find((e) => e.layer === l.id);
			if (layerEvent && l.layout) {
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
		if (!$activeChapterStore) return;
		if (!$activeChapterStore[chapterLayerEvent]) {
			$activeChapterStore[chapterLayerEvent] = [];
		}

		const layerEvent: StoryMapChapterLayerEvent = {
			layer: layerId,
			opacity: newOpacity,
			duration: 300
		};

		const index = $activeChapterStore[chapterLayerEvent].findIndex((e) => e.layer === layerId);
		if (index === -1) {
			$activeChapterStore[chapterLayerEvent] = [
				...$activeChapterStore[chapterLayerEvent],
				layerEvent
			];
		} else {
			$activeChapterStore[chapterLayerEvent][index] = layerEvent;
			$activeChapterStore[chapterLayerEvent] = [...$activeChapterStore[chapterLayerEvent]];
		}
	};

	const handleOpacityChanged = debounce((values: number, layer: LayerSpecification) => {
		const opacity = values;
		updateChangeLayerVisibility(layer.id, opacity);
		if (onchange) onchange();
	}, 300);
</script>

{#if !styleJson}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:else}
	<nav class="is-flex is-flex-direction-column">
		<FieldControl title="Show only GeoHub layers" showHelp={false}>
			{#snippet control()}
				<div>
					<Switch
						toggled={showOnlyGeoHubLayers}
						onchange={(toggled) => {
							showOnlyGeoHubLayers = toggled;
						}}
					/>
				</div>
			{/snippet}
		</FieldControl>

		<table class="table is-striped is-narrow is-hoverable is-fullwidth layer-panel">
			<tbody>
				{#key requireUpdated}
					{#each styleJson.layers as layer (layer.id)}
						{@const isGeoHub = isGeoHubLayer(layer.id)}
						{#if !showOnlyGeoHubLayers || (showOnlyGeoHubLayers && isGeoHub)}
							{@const layerName = getLayerName(layer.id)}
							{@const showOpacity = isShowOpacity(layer.id)}
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

										<div class="ml-auto">
											<OpacityEditor
												opacity={getLayerOpacity(layer.id) as number}
												{showOpacity}
												onchange={(opacity: number) => {
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
