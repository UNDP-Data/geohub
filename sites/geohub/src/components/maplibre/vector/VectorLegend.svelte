<script lang="ts">
	import VectorPolygon from '$components/maplibre/fill/VectorPolygon.svelte';
	import VectorHeatmap from '$components/maplibre/heatmap/VectorHeatmap.svelte';
	import VectorLine from '$components/maplibre/line/VectorLine.svelte';
	import VectorSymbol from '$components/maplibre/symbol/VectorSymbol.svelte';
	import { getVectorDefaultColor, loadMap } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import VectorCircle from '../circle/VectorCircle.svelte';
	import VectorFillExtrusion from '../fill-extrusion/VectorFillExtrusion.svelte';
	import VectorPropertyEditor from './VectorPropertyEditor.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const defaultColor = writable<string>('');
	const defaultLineColor = writable<string>('');

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];

	$defaultColor =
		style?.type === 'symbol'
			? getVectorDefaultColor($map, layerId, 'icon-color')
			: style?.type === 'fill'
			? getVectorDefaultColor($map, layerId, 'fill-color')
			: style?.type === 'line'
			? getVectorDefaultColor($map, layerId, 'line-color')
			: undefined;

	$defaultLineColor =
		style?.type === 'line'
			? getVectorDefaultColor($map, layerId, 'line-color', $defaultColor)
			: undefined;

	const vectorLayerLoaded = async () => {
		return await loadMap($map);
	};
</script>

<div class="legend-container">
	<div class="editor-button">
		<VectorPropertyEditor bind:layerId bind:defaultColor={$defaultColor} bind:metadata />
	</div>
	{#await vectorLayerLoaded()}
		<div class="loader-container p-3">
			<Loader size="small" />
		</div>
	{:then}
		{#if style.type === 'heatmap'}
			<VectorHeatmap {layerId} />
		{:else if style.type === 'symbol'}
			<VectorSymbol {layerId} {metadata} bind:defaultColor={$defaultColor} />
		{:else if style.type === 'line'}
			<VectorLine {layerId} {metadata} bind:defaultColor={$defaultLineColor} />
		{:else if style.type === 'circle'}
			<VectorCircle {layerId} {metadata} bind:defaultColor={$defaultColor} />
		{:else if style.type === 'fill'}
			<VectorPolygon {layerId} {metadata} bind:defaultFillColor={$defaultColor} />
		{:else if style.type === 'fill-extrusion'}
			<VectorFillExtrusion {layerId} {metadata} bind:defaultFillColor={$defaultColor} />
		{/if}
	{/await}
</div>

<style lang="scss">
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}

	.legend-container {
		position: relative;

		.editor-button {
			position: absolute;
			top: 0em;
			right: 0em;
			z-index: 10;
		}
	}
</style>
