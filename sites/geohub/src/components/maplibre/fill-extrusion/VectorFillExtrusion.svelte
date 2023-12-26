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
	import FillExtrusionColor from './FillExtrusionColor.svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'fill-extrusion-color');
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
	<FieldControl title="3D polygon color">
		<div slot="help">Change polygon fill color by using single color or selected property.</div>
		<div slot="control">
			<FillExtrusionColor {layerId} {metadata} />
		</div>
	</FieldControl>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<FillExtrusionColor {layerId} {metadata} />
{/if}
