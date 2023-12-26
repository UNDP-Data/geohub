<script lang="ts">
	import VectorPolygon from '$components/maplibre/fill/VectorPolygon.svelte';
	import VectorHeatmap from '$components/maplibre/heatmap/VectorHeatmap.svelte';
	import VectorLine from '$components/maplibre/line/VectorLine.svelte';
	import VectorSymbol from '$components/maplibre/symbol/VectorSymbol.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import VectorCircle from '../circle/VectorCircle.svelte';
	import VectorFillExtrusion from '../fill-extrusion/VectorFillExtrusion.svelte';
	import VectorPropertyEditor from './VectorPropertyEditor.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];
</script>

<div class="legend-container">
	{#if !['heatmap', 'circle'].includes(style.type)}
		<div class="editor-button" hidden={$legendReadonly}>
			<VectorPropertyEditor bind:layerId bind:metadata />
		</div>
	{/if}

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

<style lang="scss">
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
