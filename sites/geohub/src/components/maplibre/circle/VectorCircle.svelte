<script lang="ts">
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, onMount } from 'svelte';
	import CircleColor from './CircleColor.svelte';
	import CircleRadius from './CircleRadius.svelte';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'circle-color');
		if (color && ['interval', 'categorical'].includes(color['type'])) {
			isSimpleLegend = false;
		} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
			isSimpleLegend = false;
		} else {
			isSimpleLegend = true;
		}
	});
</script>

{#if !$legendReadonly}
	<FieldControl title="Circle radius">
		<div slot="help">Apply circle radius to the vector layer.</div>
		<div slot="control">
			<CircleRadius {layerId} bind:readonly={$legendReadonly} />
		</div>
	</FieldControl>

	<FieldControl title="Circle color">
		<div slot="help">Change circle color by using single color or selected property.</div>
		<div slot="control">
			<CircleColor {layerId} {metadata} />
		</div>
	</FieldControl>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<CircleColor {layerId} {metadata} />
{/if}
