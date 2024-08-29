<!-- https://design.undp.org/?path=/docs/components-ui-components-buttons-buttons--buttons -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let title = '';
	export let isArrow = false;
	export let isPrimary = true;
	export let isDisabled = false;

	const handleClicked = () => {
		if (!isDisabled) {
			dispatch('clicked');
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!isDisabled && event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
	class="button button-{isPrimary ? 'primary' : 'secondary'} {isArrow
		? 'button-arrow'
		: 'button-without-arrow'}"
	class:disabled={isDisabled}
	role="button"
	alt={title}
	tabindex="0"
	on:keydown={handleKeyDown}
	on:click={handleClicked}
>
	{title}
</a>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/buttons.min.css';

	.button {
		color: white !important;
		width: 100%;
	}

	.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
