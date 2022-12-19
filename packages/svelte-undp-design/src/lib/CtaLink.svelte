<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let label: string;
	export let isArrow = true;

	const handleClicked = () => {
		dispatch('clicked');
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
	class="cta__link {isArrow ? 'cta--arrow' : 'cta--space'}"
	on:keydown={handleKeyDown}
	on:click={handleClicked}
>
	{label}
	<i />
</a>

<style lang="scss">
	@use './css/base-minimal.min.css';
	@use './css/cta-link.min.css';
</style>
