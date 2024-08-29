<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { NumberInput } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	let readonly = false;

	let defaultValue = 5;
	let maxValue = 30;
	let minValue = 0;
	let propertyName = 'circle-radius';
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

<NumberInput
	bind:value
	bind:minValue
	bind:maxValue
	bind:step={stepValue}
	on:change={setValue}
	bind:readonly
/>
