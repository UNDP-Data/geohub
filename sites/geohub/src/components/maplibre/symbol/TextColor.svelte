<script lang="ts">
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let colorContextKey: string;
	export let classesContextKey: string;
	export let colormapContextKey: string;

	const propertyName = 'text-color';
</script>

<VectorColorClassification
	{layerId}
	{metadata}
	{propertyName}
	onlyNumberFields={false}
	{colorContextKey}
	{classesContextKey}
	{colormapContextKey}
/>
