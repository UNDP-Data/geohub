<script lang="ts">
	import NumberInput from '$components/util/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

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
