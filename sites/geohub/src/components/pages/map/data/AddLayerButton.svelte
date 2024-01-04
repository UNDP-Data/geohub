<script lang="ts">
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let isIconButton = false;
	export let title = '';
	export let isLoading = false;
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
			class="button-icon fa-stack fa-xl"
			role="button"
			tabindex="0"
			on:keydown={handleKeyDown}
			on:click={handleClicked}
		>
			<i class="fa-solid fa-layer-group fa-stack-xl" />
			<i class="fab fa-plus fa-sm fa-stack-1x" />
		</span>
	{/if}
{:else}
	<button
		class="button is-primary is-fullwidth {isLoading ? 'is-loading' : ''}"
		on:click={handleClicked}
	>
		<span class="icon">
			<i class="fa-solid fa-plus fa-lg" />
		</span>
		<span>{title}</span>
	</button>
{/if}

<style lang="scss">
	.button-icon {
		width: 30px;
		height: 30px;
		cursor: pointer;

		.fa-stack-xl {
			position: absolute;
			top: 0px;
			bottom: 0px;
		}

		.fa-stack-1x {
			width: auto;
			top: -22px;
			right: -18px;
			color: d12800;
		}
		color: #d12800;
	}
	.loader-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
