<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	import NumberInput from '$components/controls/NumberInput.svelte';
	import type { Layer } from '$lib/types';
	import { map } from '$stores';

	export let layer: Layer;
	const layerId = layer.id;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const dispatch = createEventDispatcher();

	let propertyName = 'text-max-width';
	let value = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 1;
	let layerType = 'symbol';
	let maxValue = 20;
	let minValue = 0;
	let stepValue = 1;

	$: value, setValue();

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setLayoutProperty(layerId, propertyName, value);
		dispatch('change');
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
