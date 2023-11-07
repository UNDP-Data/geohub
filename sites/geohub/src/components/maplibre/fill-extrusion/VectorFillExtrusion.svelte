<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import FillExtrusionColor from './FillExtrusionColor.svelte';

	export let layerId: string;
	export let defaultFillColor: string = undefined;
	export let metadata: VectorTileMetadata;
</script>

<FieldControl title="3D polygon color">
	<div slot="help">Change polygon fill color by using single color or selected property.</div>
	<div slot="control">
		<FillExtrusionColor {layerId} {metadata} bind:defaultColor={defaultFillColor} />
	</div>
</FieldControl>
