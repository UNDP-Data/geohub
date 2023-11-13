<script lang="ts">
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const propertyName = 'circle-color';
</script>

<!-- <MaplibreColorPicker {rgba} on:change={handleSetColor} /> -->

<VectorColorClassification {layerId} {metadata} {propertyName} />
