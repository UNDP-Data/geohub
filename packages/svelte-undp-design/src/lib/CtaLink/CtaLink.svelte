<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let label: string;
	export let isArrow = true;
	export let href = '';
	export let target = '';

	const handleClicked = () => {
		dispatch('clicked');
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

{#if href}
	<a class="cta__link {isArrow ? 'cta--arrow' : 'cta--space'}" role="button" {href} {target}>
		{label}
		<i />
	</a>
{:else}
	<!-- svelte-ignore a11y-missing-attribute -->
	<a
		class="cta__link {isArrow ? 'cta--arrow' : 'cta--space'}"
		role="button"
		tabindex="0"
		on:keydown={handleKeyDown}
		on:click={handleClicked}
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off"
	>
		{label}
		<i />
	</a>
{/if}

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
</style>
