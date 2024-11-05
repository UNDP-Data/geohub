<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/index.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/**
	 * Layer ID to edit
	 */
	export let layerId: string;

	/**
	 * Default value
	 */
	export let defaultValue = 0;

	/**
	 * Maximum value
	 */
	export let maxValue = 10;

	/**
	 * Minimum value
	 */
	export let minValue = 0;

	/**
	 * Step value
	 */
	export let stepValue = 0.5;

	let propertyName = 'circle-stroke-width';

	const getValue = () => {
		if (!$map) return;
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
