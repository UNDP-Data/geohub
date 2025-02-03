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
		defaultValue = $bindable(0),
		maxValue = $bindable(10),
		minValue = $bindable(0),
		stepValue = $bindable(0.5)
	}: Props = $props();

	let propertyName = 'circle-stroke-width';

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as number;
	};

	let value = $state(getValue());

	onMount(() => {
		setValue();
	});

	const setValue = () => {
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} onchange={setValue} />
