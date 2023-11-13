<script lang="ts">
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const propertyName = 'fill-color';
</script>

<VectorColorClassification {layerId} {metadata} {propertyName} />
