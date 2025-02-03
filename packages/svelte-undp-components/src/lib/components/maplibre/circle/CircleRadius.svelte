<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		/**
		 * Layer ID to edit
		 */
		layerId: string;
		/**
		 * If true, it becomes readonly
		 */
		readonly?: boolean;
		/**
		 * Default value
		 */
		defaultValue?: number;
		/**
		 * Maximum value
		 */
		maxValue?: number;
		/**
		 * Minimum value
		 */
		minValue?: number;
		/**
		 * Step value
		 */
		stepValue?: number;
	}

	let {
		layerId = $bindable(),
		readonly = $bindable(false),
		defaultValue = $bindable(5),
		maxValue = $bindable(30),
		minValue = $bindable(0),
		stepValue = $bindable(0.5)
	}: Props = $props();

	let propertyName = 'circle-radius';

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as number;
	};

	let value: number = $state(getValue());

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
	onchange={setValue}
	bind:readonly
/>
