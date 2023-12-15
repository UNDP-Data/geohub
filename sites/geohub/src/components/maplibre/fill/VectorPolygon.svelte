<script lang="ts">
	import FillColor from '$components/maplibre/fill/FillColor.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { LEGEND_READONLY_CONTEXT_KEY, type LegendReadonlyStore } from '$stores';
	import { getContext } from 'svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
</script>

{#if !$legendReadonly}
	<FieldControl title="Fill color">
		<div slot="help">Change polygon fill color by using single color or selected property.</div>
		<div slot="control">
			<FillColor {layerId} {metadata} />
		</div>
	</FieldControl>
{:else}
	<FillColor {layerId} {metadata} />
{/if}
