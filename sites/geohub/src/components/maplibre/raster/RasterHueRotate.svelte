<script lang="ts">
	import MaplibreSlider from '$components/maplibre/MaplibreSlider.svelte';

	export let layerId: string;

	let defaultValue = 0;
	let maxValue = 359;
	let minValue = 0;
	let propertyName = 'raster-hue-rotate';
	let stepValue = 1;
</script>

<MaplibreSlider
	{layerId}
	bind:propertyName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
/>
