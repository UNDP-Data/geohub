<script lang="ts">
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;

	const propertyName = 'fill-color';
</script>

<VectorColorClassification {layerId} {metadata} {defaultColor} {propertyName} />
