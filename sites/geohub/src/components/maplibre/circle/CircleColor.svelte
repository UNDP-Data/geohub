<script lang="ts">
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;

	const propertyName = 'circle-color';

	// const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	// export let layerId: string;
	// const propertyName = 'circle-color';
	// export let defaultColor: string = undefined;

	// const getColor = (): string => {
	// 	let color = $map.getPaintProperty(layerId, propertyName);
	// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// 	// @ts-ignore
	// 	if (!color || (color && color.type === 'interval') || (color && color.type === 'categorical')) {
	// 		color = defaultColor;
	// 	}
	// 	return color as string;
	// };

	// let rgba = getColor();

	// onMount(() => {
	// 	rgba = getColor();
	// 	map.setPaintProperty(layerId, propertyName, rgba);
	// });

	// const handleSetColor = (e: CustomEvent) => {
	// 	rgba = e.detail.color;
	// 	map.setPaintProperty(layerId, propertyName, rgba);
	// 	defaultColor = e.detail.color;
	// };
</script>

<!-- <MaplibreColorPicker {rgba} on:change={handleSetColor} /> -->

<VectorColorClassification {layerId} {metadata} {defaultColor} {propertyName} />
