<script lang="ts">
	import FillColor from '$components/maplibre/fill/FillColor.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
</script>

<FieldControl title="Fill color">
	<div slot="help">Change polygon fill color by using single color or selected property.</div>
	<div slot="control">
		<FillColor {layerId} {metadata} />
	</div>
</FieldControl>
