<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;
</script>

<FieldControl title="Line color">
	<div slot="help">Change line color by using single color or selected property.</div>
	<div slot="control">
		<LineColor {layerId} bind:defaultColor {metadata} />
	</div>
</FieldControl>

<FieldControl title="Line width">
	<div slot="help">Change line width for a vector layer</div>
	<div slot="control">
		<LineWidth {layerId} />
	</div>
</FieldControl>
