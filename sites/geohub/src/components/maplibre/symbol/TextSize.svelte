<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	import NumberInput from '$components/util/NumberInput.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

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
