<script lang="ts">
	import MaplibreSlider from '$components/maplibre/MaplibreSlider.svelte';

	export let layerId: string;

	let defaultValue = 30;
	let maxValue = 100;
	let minValue = 1;
	let propertyName = 'heatmap-radius';
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
