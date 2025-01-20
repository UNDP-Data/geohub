<script lang="ts">
	import { NumberInput } from '$lib/components/ui/index.js';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let defaultHaloWidth: number = 1;

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];
	const dispatch = createEventDispatcher();

	let propertyName = 'text-halo-width';
	let value =
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultHaloWidth;
	let layerType = 'symbol';
	let maxValue = 10;
	let minValue = 0;
	let stepValue = 0.1;

	$: value, setValue();

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setPaintProperty(layerId, propertyName, Number(value));
		dispatch('change');
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
