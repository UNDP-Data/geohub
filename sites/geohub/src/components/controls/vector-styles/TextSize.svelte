<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	import NumberInput from '$components/controls/NumberInput.svelte';
	import type { Layer } from '$lib/types';
	import { map } from '$stores';

	export let layer: Layer;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let layerType = 'symbol';
	let maxValue = 32;
	let minValue = 0;
	let propertyName = 'text-size';
	let stepValue = 0.5;
	let value = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 16;

	$: value, setValue();

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setLayoutProperty(layerId, propertyName, value);
		dispatch('change');
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
