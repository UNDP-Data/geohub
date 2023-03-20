<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let label: string;
	export let checked = false;

	const handleChecked = () => {
		dispatch('clicked');
	};
</script>

<div class="form-check vertical-align">
	<label>
		<input data-testid="checkbox" type="checkbox" bind:checked on:click={handleChecked} />
		{label}
	</label>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/checkbox.min.css';

	.vertical-align input {
		vertical-align: middle;
	}
</style>
