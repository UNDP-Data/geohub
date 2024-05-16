<script lang="ts">
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let isIconButton = false;
	export let title = '';
	export let isLoading = false;

	const tippyTooltip = initTooltipTippy();

	const handleClicked = () => {
		dispatch('clicked');
	};
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

{#if isIconButton}
	{#if isLoading}
		<div class="loader-container">
			<Loader size="small" />
		</div>
	{:else}
		<span
			class="button-icon has-text-grey-dark fa-stack"
			role="button"
			tabindex="0"
			on:keydown={handleKeyDown}
			on:click={handleClicked}
			use:tippyTooltip={{ content: 'Add this dataset to the map' }}
		>
			<i class="fa-solid fa-layer-group fa-stack-xl" />
			<i class="fab fa-plus fa-sm fa-stack-1x" />
		</span>
	{/if}
{:else}
	<button
		class="button is-primary is-uppercase has-text-weight-bold is-fullwidth {isLoading
			? 'is-loading'
			: ''}"
		on:click={handleClicked}
	>
		{title}
	</button>
{/if}

<style lang="scss">
	.button-icon {
		width: 24px;
		height: 16px;
		cursor: pointer;

		.fa-stack-xl {
			position: absolute;
			top: 0px;
			bottom: 0px;
		}

		.fa-stack-1x {
			width: auto;
			top: -16px;
			right: -16px;
			color: d12800;
		}
	}
	.loader-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
