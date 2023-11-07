<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import CircleColor from './CircleColor.svelte';
	import CircleRadius from './CircleRadius.svelte';

	export let layerId: string;
	export let defaultColor: string = undefined;
	export let metadata: VectorTileMetadata;
</script>

<FieldControl title="Circle radius">
	<div slot="help">Apply circle radius to the vector layer.</div>
	<div slot="control">
		<CircleRadius {layerId} />
	</div>
</FieldControl>

<FieldControl title="Circle color">
	<div slot="help">Change circle color by using single color or selected property.</div>
	<div slot="control">
		<CircleColor {layerId} {metadata} bind:defaultColor />
	</div>
</FieldControl>
