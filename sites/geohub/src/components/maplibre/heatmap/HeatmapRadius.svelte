<script lang="ts">
	import Slider from '$components/maplibre/heatmap/Slider.svelte';
	import type { Layer } from '$lib/types';

	export let layer: Layer;

	let defaultValue = 30;
	let layerType = 'heatmap';
	let maxValue = 100;
	let minValue = 1;
	let propertyName = 'heatmap-radius';
	let stepValue = 1;
	let titleName = 'Heatmap Radius';
</script>

<Slider
	{layer}
	styleControlGroupDisabled={true}
	bind:layerType
	bind:propertyName
	bind:titleName
	bind:defaultValue
	bind:minValue
	bind:maxValue
	bind:stepValue
/>
