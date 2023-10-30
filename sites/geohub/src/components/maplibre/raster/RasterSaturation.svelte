<script lang="ts">
	import MaplibreSlider from '$components/maplibre/MaplibreSlider.svelte';

	export let layerId: string;

	let defaultValue = 0;
	let maxValue = 1;
	let minValue = -1;
	let propertyName = 'raster-saturation';
	let stepValue = 0.1;
</script>

<MaplibreSlider
	{layerId}
	bind:propertyName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
/>
