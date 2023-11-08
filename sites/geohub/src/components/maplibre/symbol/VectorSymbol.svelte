<script lang="ts">
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;
</script>

<FieldControl title="Icon">
	<div slot="help">Change icon for a vector layer.</div>
	<div slot="control">
		<IconImage {layerId} bind:defaultColor />
	</div>
</FieldControl>

<FieldControl title="Icon color">
	<div slot="help">Change icon color by using single color or selected property.</div>
	<div slot="control">
		<IconColor {layerId} {metadata} bind:defaultColor />
	</div>
</FieldControl>
