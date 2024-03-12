<script lang="ts">
	import { NumberInput } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let decimalPosition = 0;

	let maxValue = 10;
	let minValue = 1;
	let stepValue = 1;

	const handleChanged = () => {
		dispatch('change', {
			decimalPosition
		});
	};
</script>

<NumberInput
	bind:value={decimalPosition}
	bind:minValue
	bind:maxValue
	bind:step={stepValue}
	on:change={handleChanged}
/>
