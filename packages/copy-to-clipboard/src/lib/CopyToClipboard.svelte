<script lang="ts">
	import { copy } from 'svelte-copy';
	import { isValidUrl } from '$lib/isValidUrl';

	/**
	 * text value to copy to clipboard
	 */
	export let value: string;

	/**
	 * If enabled, input/textarea element will be readonly. Default is true
	 */
	export let readonly = true;

	/**
	 * Placeholder text. Default is 'Copy to clipboard'
	 */
	export let placeholder = 'Copy to clipboard';

	/**
	 * Button text before copying to clipboard. Default is 'Copy'
	 */
	export let textCopy = 'Copy';

	/**
	 * Button text after copying to clipboard. Default is 'Copied'.
	 */
	export let textCopied = 'Copied';

	/**
	 * Control width. Default is '100%''
	 */
	export let width = '100%';

	/**
	 * Timeout (milliseconds) to change button text back to the 'textCopied' value. Default is 5000ms (5 seconds)
	 */
	export let timeout = 5000;

	/**
	 * If enabled, textarea element is used instead of input. Default is false
	 */
	export let isMultiline = false;

	/**
	 * Control size
	 */
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';

	/**
	 * If enabled, open URL as a new tab. Default is true
	 */
	export let openNewTab = true;

	/**
	 * Color for open link button.
	 * See supported bulma color classes here.
	 * https://bulma.io/documentation/helpers/color-helpers/
	 */
	export let openButtonColor = 'has-text-link';

	let textCopyButton = textCopy;

	const handleCopy = () => {
		textCopyButton = textCopied;
		setTimeout(() => {
			textCopyButton = textCopy;
		}, timeout);
	};

	const getButtonSize = () => {
		let buttonSize = 'is-small';
		if (size === 'small') {
			buttonSize = 'small-button';
		} else if (size === 'medium') {
			buttonSize = 'is-normal';
		} else if (size === 'large') {
			buttonSize = 'is-medium';
		}
		return buttonSize;
	};
</script>

<div class="copy-to-clipboard" style="width: {width};">
	{#if !isMultiline}
		<input
			data-testid="input-control"
			class="input is-{size}"
			type="text"
			{placeholder}
			bind:value
			onclick="this.select()"
			{readonly}
		/>
	{:else}
		<textarea
			data-testid="textarea-control"
			class="textarea is-{size} has-fixed-size"
			{placeholder}
			onclick="this.select()"
			{readonly}>{value}</textarea
		>
	{/if}

	<div class="buttons has-addons copy-buttons">
		<button
			class="button {getButtonSize()}"
			use:copy={value}
			on:click={handleCopy}
			data-testid="copy-button"
		>
			<span class="icon">
				<i class="fa-regular fa-copy"></i>
			</span>
			<span>{textCopyButton}</span>
		</button>

		{#if isValidUrl(value)}
			<a
				class="button {getButtonSize()} ml-1"
				data-testid="open-button"
				href={value}
				target={openNewTab ? '_blank' : ''}
			>
				<span class="icon {openButtonColor}">
					<i class="fa-solid fa-arrow-up-right-from-square"></i>
				</span>
			</a>
		{/if}
	</div>
</div>

<style lang="scss">
	.copy-to-clipboard {
		position: relative;

		.copy-buttons {
			position: absolute;
			right: 5px;
			top: 5px;

			.small-button {
				font-size: 0.5rem;
			}
		}
	}
</style>
