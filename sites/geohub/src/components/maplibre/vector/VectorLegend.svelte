<script lang="ts">
	import VectorCircle from '$components/maplibre/circle/VectorCircle.svelte';
	import VectorFillExtrusion from '$components/maplibre/fill-extrusion/VectorFillExtrusion.svelte';
	import VectorPolygon from '$components/maplibre/fill/VectorPolygon.svelte';
	import VectorHeatmap from '$components/maplibre/heatmap/VectorHeatmap.svelte';
	import VectorLine from '$components/maplibre/line/VectorLine.svelte';
	import VectorSymbol from '$components/maplibre/symbol/VectorSymbol.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];
</script>

<div class="legend-container">
	{#if style.type === 'heatmap'}
		<VectorHeatmap {layerId} />
	{:else if style.type === 'symbol'}
		<VectorSymbol {layerId} {metadata} />
	{:else if style.type === 'line'}
		<VectorLine {layerId} {metadata} />
	{:else if style.type === 'circle'}
		<VectorCircle {layerId} {metadata} />
	{:else if style.type === 'fill'}
		<VectorPolygon {layerId} {metadata} />
	{:else if style.type === 'fill-extrusion'}
		<VectorFillExtrusion {layerId} {metadata} />
	{/if}
</div>
