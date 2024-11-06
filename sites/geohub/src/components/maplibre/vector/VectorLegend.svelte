<script lang="ts">
	import VectorSymbol from '$components/maplibre/symbol/VectorSymbol.svelte';
	import VectorCircle from '$components/maplibre/vector/VectorCircle.svelte';
	import VectorFillExtrusion from '$components/maplibre/vector/VectorFillExtrusion.svelte';
	import VectorHeatmap from '$components/maplibre/vector/VectorHeatmap.svelte';
	import VectorLine from '$components/maplibre/vector/VectorLine.svelte';
	import VectorPolygon from '$components/maplibre/vector/VectorPolygon.svelte';
	import type { Tag } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		type MapStore,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];
</script>

<div class="legend-container">
	{#if style.type === 'heatmap'}
		<VectorHeatmap {layerId} {tags} />
	{:else if style.type === 'symbol'}
		<VectorSymbol {layerId} {metadata} {tags} />
	{:else if style.type === 'line'}
		<VectorLine {layerId} {metadata} {tags} />
	{:else if style.type === 'circle'}
		<VectorCircle {layerId} {metadata} {tags} />
	{:else if style.type === 'fill'}
		<VectorPolygon {layerId} {metadata} {tags} />
	{:else if style.type === 'fill-extrusion'}
		<VectorFillExtrusion {layerId} {metadata} {tags} />
	{/if}
</div>
