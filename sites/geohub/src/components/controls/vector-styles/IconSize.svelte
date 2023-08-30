<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';

	import NumberInput from '$components/controls/NumberInput.svelte';
	import type { Layer } from '$lib/types';
	import { map } from '$stores';

	export let layer: Layer;

	const layerId = layer.id;
	const propertyName = 'icon-size';
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let maxValue = 5;
	let minValue = 0;
	let stepValue = 0.25;

	const getValue = () => {
		if (style?.layout && style.layout[propertyName]) {
			return style.layout[propertyName];
		} else {
			return 1;
		}
	};

	let value = getValue();

	onMount(() => {
		setValue();
	});

	const setValue = () => {
		map.setLayoutProperty(layer.id, propertyName, value);
	};
</script>

<div data-testid="icon-size-input">
	<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
</div>
