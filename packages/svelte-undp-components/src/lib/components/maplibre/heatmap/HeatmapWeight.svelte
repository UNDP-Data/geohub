<script lang="ts">
	import MaplibreSlider from '$lib/components/maplibre/util/MaplibreSlider.svelte';

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	let defaultValue = $state(1);
	let maxValue = $state(10);
	let minValue = $state(0);
	let propertyName = $state('heatmap-weight');
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
