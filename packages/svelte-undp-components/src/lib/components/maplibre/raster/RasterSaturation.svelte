<script lang="ts">
	import MaplibreSlider from '$lib/components/maplibre/util/MaplibreSlider.svelte';

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	let defaultValue = $state(0);
	let maxValue = $state(1);
	let minValue = $state(-1);
	let propertyName = $state('raster-saturation');
	let stepValue = $state(0.1);
</script>

<MaplibreSlider
	{layerId}
	bind:propertyName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
/>
