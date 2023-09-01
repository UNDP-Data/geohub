<script lang="ts">
	import { handleEnterKey } from '$lib/helper';

	export let show = false;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
	class="details"
	role="button"
	tabindex="0"
	on:click={() => (show = !show)}
	on:keydown={handleEnterKey}
>
	{#if show}
		Hide details
	{:else}
		Show details
	{/if}
	<i class={show ? 'triangle-up' : 'triangle-down'}></i>
</a>

<style lang="scss">
	.details {
		position: relative;
		color: gray;
		text-decoration: underline dotted gray;

		.triangle-up {
			position: absolute;
			bottom: 0.5em;
			right: -1em;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-bottom: 5px solid black;
		}

		.triangle-down {
			position: absolute;
			bottom: 0.5em;
			right: -1em;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-top: 5px solid black;
		}
	}
</style>
