<script lang="ts">
	import { VectorFilterOperators } from '$lib/config/AppConfig';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';

	import { createEventDispatcher } from 'svelte';

	export let currentSelectedOperation = '';
	export let stringProperty = false;
	export let numberProperty = false;

	const operationOptions = VectorFilterOperators.filter((el) => {
		if (stringProperty && ['>', '<'].includes(el.value)) return false;
		if (numberProperty && ['in', '!in'].includes(el.value)) return false;
		return true;
	});

	const dispatch = createEventDispatcher();

	$: currentSelectedOperation, handleOperationChange();
	const handleOperationChange = () => {
		if (currentSelectedOperation === '==' || currentSelectedOperation === '!=') {
			dispatch('disableTags');
		} else {
			dispatch('enableTags');
		}
		dispatch('change', {
			operation: currentSelectedOperation
		});
	};
</script>

<div class="grid p-0" role="menu">
	{#each operationOptions as operation}
		<div
			data-testid="operation-button"
			class="card grid-item p-0 m-0 is-clickable {operation.disabled ? 'disabled' : null} "
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={() => {
				operation.disabled ? null : (currentSelectedOperation = operation.value);
				operation.disabled ? null : dispatch('click');
			}}
		>
			<div
				class="card-header is-size-6 pb-0 pt-0 m-0 {currentSelectedOperation === operation.value
					? 'has-background-success'
					: 'has-background-info'} "
			>
				<span
					class="card-header-title is-centered is-v-centered {currentSelectedOperation ===
					operation.value
						? 'has-text-white-ter'
						: 'has-text-white-ter'}  "
				>
					{#if currentSelectedOperation === operation.value}
						<span class="icon">
							<i class="fa-solid fa-check" />
						</span>
					{/if}
					{operation.label}
				</span>
			</div>
			<div class="card-content p-0 m-0 has-text-centered">
				<div class="content is-size-2 p-0 m-0 has-text-weight-bold has-text-danger">
					{operation.symbol}
				</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 5px;
		padding: 0px;
	}

	.disabled {
		opacity: 0.5;
		background-color: white !important;
		cursor: not-allowed !important;
	}
</style>
