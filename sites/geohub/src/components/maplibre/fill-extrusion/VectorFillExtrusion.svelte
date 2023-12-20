<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { LEGEND_READONLY_CONTEXT_KEY, type LegendReadonlyStore } from '$stores';
	import { getContext } from 'svelte';
	import FillExtrusionColor from './FillExtrusionColor.svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
</script>

{#if !$legendReadonly}
	<FieldControl title="3D polygon color">
		<div slot="help">Change polygon fill color by using single color or selected property.</div>
		<div slot="control">
			<FillExtrusionColor {layerId} {metadata} />
		</div>
	</FieldControl>
{:else}
	<FillExtrusionColor {layerId} {metadata} />
{/if}
