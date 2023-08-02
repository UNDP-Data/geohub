<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const operators = {
		title: 'Operators',
		operators: ['==', '!=', '>', '>=', '<', '<=', 'in', '!in', ',']
	};

	const handleOperatorClick = (op) => {
		dispatch('operatorselected', {
			operator: op
		});
	};
</script>

<div class=" column" data-testid="vector-filter-operators-container">
	<div class="setmembership">
		<div class="buttons" style="display: flex; ">
			{#each operators.operators as operator}
				<button
					class="button is-small"
					on:click={() => handleOperatorClick(operator)}
					alt={operator}
					title={operator}
				>
					<span>{operator}</span>
				</button>
			{/each}
		</div>
	</div>
</div>
