<script lang="ts">
	import { distinct } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import SortLayer from './SortLayer.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		onlyRendered?: boolean;
		onlyRelative?: boolean;
		relativeLayers?: { [key: string]: string };
	}

	let {
		onlyRendered = true,
		onlyRelative = true,
		relativeLayers = $bindable({})
	}: Props = $props();

	let style: StyleSpecification | undefined = $state();
	let hovering: boolean | number | undefined = $state(false);
	let visibleLayerMap: { [key: string]: LayerSpecification } = $state({});

	const handleStyleChanged = () => {
		if (!$map) return;
		style = $map.getStyle();

		if ($map.isStyleLoaded()) {
			updateLayers();
		} else {
			setTimeout(handleStyleChanged, 500);
		}
	};

	const updateLayers = () => {
		if (!$map) return;
		if (!style) return;
		visibleLayerMap = {};
		const all = $map.getStyle().layers;
		if (onlyRendered === true) {
			const features = $map.queryRenderedFeatures();
			const ids = features.map((f) => f.layer.id).filter(distinct);
			const zoom = $map.getZoom();
			all.forEach((layer) => {
				const minzoom = layer.minzoom ?? 0;
				const maxzoom = layer.maxzoom ?? 24;
				if (ids.indexOf(layer.id) !== -1) {
					visibleLayerMap[layer.id] = layer;
				} else if (['heatmap', 'hillshade'].includes(layer.type)) {
					if (zoom >= minzoom && zoom <= maxzoom) {
						visibleLayerMap[layer.id] = layer;
					}
				}
			});
		} else {
			all.forEach((layer) => {
				visibleLayerMap[layer.id] = layer;
			});
		}
		allLayers = [...all];
	};

	const layerOrderChanged = () => {
		allLayers = $map.getStyle().layers;
		handleStyleChanged();
	};

	const drop = (event, target: number, layer?: LayerSpecification) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';

		const start = parseInt(event.dataTransfer.getData('text/plain'), 10);
		if (isNaN(start) || start < 0 || start >= allLayers.length) {
			return;
		}

		const newTracklist = [...allLayers];

		if (start <= target) {
			newTracklist.splice(target + 1, 0, newTracklist[start]);
			newTracklist.splice(start, 1);
		} else {
			newTracklist.splice(target, 0, newTracklist[start]);
			newTracklist.splice(start + 1, 1);
		}
		allLayers = newTracklist;
		hovering = undefined;

		const targetLayer = allLayers[target];
		if (layer?.id) {
			$map.moveLayer(targetLayer.id, layer.id);
		} else {
			const startLayer = $map.getStyle().layers[start];
			$map.moveLayer(startLayer.id);
		}
		layerOrderChanged();
	};

	const dragstart = (event, i: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const start = i;
		event.dataTransfer.setData('text/plain', start);
	};

	const dragover = (event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	};

	const getLastVisibleIndex = () => {
		let lastIndex = 0;
		allLayers?.forEach((layer, index) => {
			if (onlyRendered === true) {
				if (visibleLayerMap[layer.id]) {
					if (onlyRelative === true) {
						if (relativeLayers[layer.id]) {
							lastIndex = index;
						}
					} else {
						lastIndex = index;
					}
				}
			} else if (onlyRelative === true) {
				if (relativeLayers[layer.id]) {
					lastIndex = index;
				}
			} else {
				lastIndex = index;
			}
		});
		return lastIndex + 1;
	};

	const isRelativeLayer = (layerId: string) => {
		let isRelative = false;
		if (relativeLayers[layerId]) {
			isRelative = true;
		} else {
			if (layerId.indexOf('heatmap') > 0 && relativeLayers[layerId.replace('heatmap', '').trim()]) {
				isRelative = true;
			}
		}
		return isRelative;
	};

	const showOnList = (layerId: string) => {
		let isShow = false;
		if (onlyRendered === true) {
			if (visibleLayerMap[layerId]) {
				if (onlyRelative === true) {
					if (isRelativeLayer(layerId)) {
						isShow = true;
					}
				} else {
					isShow = true;
				}
			}
		} else if (onlyRelative === true) {
			if (isRelativeLayer(layerId)) {
				isShow = true;
			}
		} else {
			isShow = true;
		}
		return isShow;
	};
	let allLayers: LayerSpecification[] = $state([]);

	$effect(() => {
		if ($map) {
			$map.on('moveend', updateLayers);
			$map.on('styledata', handleStyleChanged);

			style = $map.getStyle();
		}
	});

	onMount(() => {
		if (style) {
			allLayers = style.layers;
		}
		updateLayers();
	});
</script>

<ul class="legend-panel">
	{#key style}
		{#each allLayers as layer, index (layer.id)}
			{#if showOnList(layer.id)}
				<div
					role="list"
					class="list-item"
					draggable={true}
					ondragstart={(event) => dragstart(event, index)}
					ondrop={(event) => drop(event, index, layer)}
					ondragover={(event) => dragover(event)}
					ondragenter={() => {
						hovering = index;
					}}
					class:is-active={hovering === index}
				>
					<li class="legend-panel-block">
						<SortLayer {layer} {relativeLayers} onchange={layerOrderChanged} />
					</li>
				</div>
			{/if}
		{/each}
		<div
			role="list"
			class="list-item"
			style="height: 40px;"
			draggable={false}
			ondrop={(event) => drop(event, getLastVisibleIndex())}
			ondragover={(event) => dragover(event)}
			ondragenter={() => {
				hovering = getLastVisibleIndex();
			}}
			class:is-active={hovering === getLastVisibleIndex()}
		>
			{#if hovering === getLastVisibleIndex()}
				<div class="last-drop-area">Drag to the last</div>
			{/if}
		</div>
	{/key}
</ul>

<style lang="scss">
	.legend-panel {
		display: block;
		list-style-type: disc;
		margin-block-start: 0em;
		margin-block-end: 0em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		padding-inline-start: 0.5rem;

		.list-item {
			display: block;
		}

		.list-item:not(:last-child) {
			border-bottom: 0.5px solid rgb(197, 197, 197);
		}

		.list-item.is-active {
			border-top: 3px solid rgb(111, 111, 111);
			background-color: rgb(197, 197, 197);
		}

		.last-drop-area {
			font-weight: bold;
			background-color: #f5f5f5;
			text-align: center;
			padding-top: 30px;
			padding-bottom: 30px;
			width: 100%;
		}

		.legend-panel-block {
			display: flex;
			vertical-align: middle;
			justify-content: left;
			align-items: left;
			margin: 0;
			padding: 0.2rem;
			border-bottom: 0.1rem solid rgb(197, 197, 197);
		}

		.legend-panel-block:hover {
			background-color: rgb(239, 239, 239);
		}
	}
</style>
