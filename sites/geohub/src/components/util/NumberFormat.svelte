<script lang="ts">
	import NumberInput from '$components/util/NumberInput.svelte';

	export let decimalPosition = 0;

	let maxValue = 10;
	let minValue = 1;
	let stepValue = 1;
</script>

<NumberInput bind:value={decimalPosition} bind:minValue bind:maxValue bind:step={stepValue} />
