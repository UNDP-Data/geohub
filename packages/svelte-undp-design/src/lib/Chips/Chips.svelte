<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let label: string;
	export let showDelete = false;

	const handleClick = (e: { preventDefault: () => void }) => {
		if (!showDelete) {
			e.preventDefault();
			return;
		}
		dispatch('delete', { label });
	};
</script>

<button class="chip {showDelete ? 'chip__cross' : ''}" type="button" on:click={handleClick}>
	{label}
</button>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/chips.min.css';

	.chip {
		cursor: default;
		&.chip__cross {
			cursor: pointer;
		}
	}
</style>
