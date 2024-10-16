<script lang="ts">
	import { clean, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const tippyTooltip = initTooltipTippy();
	const dispatch = createEventDispatcher();

	export let name: string;
	export let order: 'asc' | 'desc' = 'desc';
	export let width: number | undefined = undefined;
	export let isActive = false;
	export let isFiltered = false;

	const handleColumnClick = () => {
		if (isActive) {
			order = order === 'asc' ? 'desc' : 'asc';
		} else {
			order = 'asc';
			isActive = true;
		}
		dispatch('change', {
			name: name,
			order: order,
			isActive: isActive
		});
	};
</script>

<button
	class="button sort-button"
	on:click={handleColumnClick}
	use:tippyTooltip={{
		content: `Click to sort by ${clean(name)}`
	}}
>
	<span class="label is-flex" style={width ? `max-width: ${width}px;` : ''}>
		{#if isFiltered}
			<span class="material-symbols-outlined"> filter_alt </span>
		{/if}
		{clean(name)}
	</span>

	{#if isActive}
		<span class="icon is-small">
			<span class="material-symbols-outlined sort-icon">
				{#if order === 'desc'}
					arrow_upward
				{:else}
					arrow_downward
				{/if}
			</span>
		</span>
	{/if}
</button>

<style lang="scss">
	.sort-button {
		border: none;
		padding: 0;
		background: transparent;
		box-shadow: none;

		.sort-icon {
			font-size: 16px;
			margin-bottom: auto;
		}
	}
</style>
