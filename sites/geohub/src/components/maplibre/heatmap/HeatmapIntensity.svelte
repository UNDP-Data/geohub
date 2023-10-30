<script lang="ts">
	import MaplibreSlider from '$components/maplibre/MaplibreSlider.svelte';

	export let layerId: string;

	let defaultValue = 1;
	let maxValue = 5;
	let minValue = 0;
	let propertyName = 'heatmap-intensity';
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
