<script lang="ts">
	import MaplibreSlider from '$lib/components/maplibre/util/MaplibreSlider.svelte';

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	let defaultValue = $state(0);
	let maxValue = $state(359);
	let minValue = $state(0);
	let propertyName = $state('raster-hue-rotate');
	let stepValue = $state(1);
</script>

<MaplibreSlider
	{layerId}
	bind:propertyName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
/>
