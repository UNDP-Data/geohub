<script lang="ts">
	import NumberInput from '$components/util/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let defaultValue = 50;
	let maxValue = 10;
	let minValue = 0;
	let propertyName = 'circle-stroke-width';
	let stepValue = 0.5;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as number;
	};

	let value = getValue();

	onMount(() => {
		setValue();
	});

	const setValue = () => {
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
