<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let defaultSize = 16;

	const dispatch = createEventDispatcher();

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let layerType = 'symbol';
	let maxValue = 32;
	let minValue = 0;
	let propertyName = 'text-size';
	let stepValue = 0.5;
	let value = style.layout && style.layout[propertyName] ? style.layout[propertyName] : defaultSize;

	$: value, setValue();

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setLayoutProperty(layerId, propertyName, value);
		dispatch('change');
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
