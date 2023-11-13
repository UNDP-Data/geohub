<script lang="ts">
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		offset: [10, 0]
	});
	let tooltipContent: HTMLElement;

	export let width: number;
	export let enabled = false;

	const handleChanged = () => {
		enabled = !enabled;
		dispatch('change', { enabled });
	};
</script>

<button class="button pr-1" bind:clientWidth={width} use:tippy={{ content: tooltipContent }}>
	<span class="icon is-small">
		<i class="fa-solid fa-caret-down fa-lg"></i>
	</span>
</button>

<div class="dropdown-content" bind:this={tooltipContent}>
	<!-- svelte-ignore a11y-missing-attribute -->
	<a
		class="dropdown-item"
		role="button"
		tabindex="0"
		on:click={handleChanged}
		on:keydown={handleEnterKey}
		data-sveltekit-preload-code="off"
		data-sveltekit-preload-data="off"
	>
		{#if !enabled}
			Use advanced classification
		{:else}
			Use a linear colormap
		{/if}
	</a>
</div>

<style lang="scss">
	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
