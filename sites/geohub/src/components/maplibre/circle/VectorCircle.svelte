<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { LEGEND_READONLY_CONTEXT_KEY, type LegendReadonlyStore } from '$stores';
	import { getContext } from 'svelte';
	import CircleColor from './CircleColor.svelte';
	import CircleRadius from './CircleRadius.svelte';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
</script>

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
