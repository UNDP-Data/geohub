<script lang="ts">
	import NumberInput from '$components/util/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
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
		map.setLayoutProperty(layerId, propertyName, value);
	};
</script>

<div data-testid="icon-size-input">
	<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
</div>
