<script lang="ts">
	import { handleEnterKey } from '$lib/util/index.js';

	interface Props {
		show?: boolean;
		showText?: string;
		hideText?: string;
	}

	let {
		show = $bindable(false),
		showText = $bindable('Hide details'),
		hideText = $bindable('Show details')
	}: Props = $props();
</script>

<span
	class="details"
	role="button"
	tabindex="0"
	onclick={() => (show = !show)}
	onkeydown={handleEnterKey}
>
	{#if show}
		{showText}
	{:else}
		{hideText}
	{/if}
	<i class={show ? 'triangle-up' : 'triangle-down'}></i>
</span>

<style lang="scss">
	.details {
		position: relative;
		color: gray;
		text-decoration: underline dotted gray;
		cursor: pointer;

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
