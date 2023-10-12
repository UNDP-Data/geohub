<script lang="ts">
	import type { OperatorCategory } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	export let operatorCategory: OperatorCategory;
	const dispatch = createEventDispatcher();
	export let simpleExpressionAvailable;
</script>

<div class={operatorCategory.isVisible ? 'content' : 'is-hidden'}>
	<div class="is-size-7 has-text-weight-semibold pl-3 has-text-centered">
		{operatorCategory.title}
	</div>
	<div class="category">
		{#each operatorCategory.operators as operator}
			<div class="oper">
				<button
					disabled={(operatorCategory.name === 'arithmetic' && !simpleExpressionAvailable) ||
						(operatorCategory.name === 'comparison' && simpleExpressionAvailable)}
					class="button is-small fixedw"
					on:click={() => {
						dispatch(`${operatorCategory.title}ButtonClick`, { operator });
					}}
					alt={operator}
					title={operator}
				>
					<span>{operator}</span>
				</button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.category {
		padding: 2px;
		justify-items: stretch;
		display: grid;
		//grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;

		//grid-auto-flow: row;
		grid-auto-flow: column;
		gap: 2px;
	}

	.fixedw {
		width: 30px;
	}
</style>
