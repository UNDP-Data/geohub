<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const numbers: Array<string> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-']; //, '(', ')']
	const dispatch = createEventDispatcher();

	let numbersString: string;
	$: {
		dispatch('click', {
			value: Number(numbersString) as number
		});
	}
</script>

<div class="grid-container pt-5">
	{#each numbers as number}
		<button
			on:click={() => {
				numbersString = numbersString !== undefined ? numbersString + number : number;
			}}
			class="button is-outlined is-info has-text-weight-bold"
		>
			{number}
		</button>
	{/each}
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-gap: 5px;
		grid-auto-flow: dense;
	}
</style>
