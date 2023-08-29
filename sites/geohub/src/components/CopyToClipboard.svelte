<script lang="ts">
	import { copy } from 'svelte-copy';

	export let value: string;
	export let placeholder = 'Copy to clipboard';
	export let textCopy = 'Copy';
	export let textCopied = 'Copied';
	export let width = '100%';
	export let timeout = 5000;
	export let isMultiline = false;

	let textCopyButton = textCopy;

	const handleCopy = () => {
		textCopyButton = textCopied;
		setTimeout(() => {
			textCopyButton = textCopy;
		}, timeout);
	};
</script>

<div class="copy-to-clipboard" style="width: {width};">
	{#if !isMultiline}
		<input class="input" type="text" {placeholder} bind:value onclick="this.select()" readonly />
	{:else}
		<textarea class="textarea has-fixed-size" {placeholder} onclick="this.select()" readonly
			>{value}</textarea
		>
	{/if}
	<button class="button is-small style-copy" use:copy={value} on:click={handleCopy}>
		<span class="icon">
			<i class="fa-regular fa-copy"></i>
		</span>
		<span>{textCopyButton}</span>
	</button>
</div>

<style lang="scss">
	.copy-to-clipboard {
		position: relative;

		.style-copy {
			position: absolute;
			right: 5px;
			top: 5px;
		}
	}
</style>
