<script lang="ts">
	import MaplibreSlider from '$components/maplibre/MaplibreSlider.svelte';

	export let layerId: string;

	let defaultValue = 0;
	let maxValue = 9999;
	let minValue = 0;
	let propertyName = 'fill-extrusion-base';
	let stepValue = 1;
	let suffix = 'm';
</script>

<MaplibreSlider
	{layerId}
	bind:propertyName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
	bind:suffix
/>
