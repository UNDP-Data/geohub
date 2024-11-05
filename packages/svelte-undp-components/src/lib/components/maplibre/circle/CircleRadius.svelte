<script lang="ts">
	import NumberInput from '$lib/components/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/index.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/**
	 * Layer ID to edit
	 */
	export let layerId: string;

	/**
	 * If true, it becomes readonly
	 */
	export let readonly = false;

	/**
	 * Default value
	 */
	export let defaultValue = 5;

	/**
	 * Maximum value
	 */
	export let maxValue = 30;

	/**
	 * Minimum value
	 */
	export let minValue = 0;

	/**
	 * Step value
	 */
	export let stepValue = 0.5;

	let propertyName = 'circle-radius';

	const getValue = () => {
		if (!$map) return defaultValue;
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as number;
	};

	let value: number = getValue();

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
