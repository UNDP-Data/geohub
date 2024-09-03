<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	const dispatch = createEventDispatcher();

	export let label: string;
	export let checked = false;
	export let disabled = false;

	let labelId = uuidv4();

	const handleChecked = () => {
		dispatch('clicked');
	};
</script>

<div class="form-check vertical-align {disabled ? 'has-text-grey-light' : ''}">
	<input
		{disabled}
		data-testid="checkbox"
		id={labelId}
		type="checkbox"
		bind:checked
		on:click={handleChecked}
	/>
	<label for={labelId}>
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
