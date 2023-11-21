<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let label: string;
	export let checked = false;

	export let disabled = false;

	const handleChecked = () => {
		dispatch('clicked');
	};
</script>

<div class="form-check vertical-align {disabled ? 'has-text-grey-light' : ''}">
	<input
		{disabled}
		data-testid="checkbox"
		id="checkbox"
		type="checkbox"
		bind:checked
		on:click={handleChecked}
	/>
	<label for="checkbox">
		{label}
	</label>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/checkbox.min.css';

	input[type='checkbox']:disabled {
		opacity: 0.5;
	}

	.vertical-align {
		align-content: center;
	}
</style>
