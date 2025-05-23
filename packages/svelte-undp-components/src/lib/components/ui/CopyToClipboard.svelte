<script lang="ts">
	import { isValidUrl } from '$lib/util/isValidUrl';
	import { copy } from 'svelte-copy';

	interface Props {
		/**
		 * text value to copy to clipboard
		 */
		value: string;
		/**
		 * If enabled, input/textarea element will be readonly. Default is true
		 */
		readonly?: boolean;
		/**
		 * Placeholder text. Default is 'Copy to clipboard'
		 */
		placeholder?: string;
		/**
		 * Button text before copying to clipboard. Default is 'Copy'
		 */
		textCopy?: string;
		/**
		 * Button text after copying to clipboard. Default is 'Copied'.
		 */
		textCopied?: string;
		/**
		 * Control width. Default is '100%''
		 */
		width?: string;
		/**
		 * Timeout (milliseconds) to change button text back to the 'textCopied' value. Default is 5000ms (5 seconds)
		 */
		timeout?: number;
		/**
		 * If enabled, textarea element is used instead of input. Default is false
		 */
		isMultiline?: boolean;

		/**
		 * The number of rows for the textarea element. Default is 5. This property is only used when isMultiline is true.
		 */
		rows?: number;

		/**
		 * Control size
		 */
		size?: 'small' | 'normal' | 'medium' | 'large';
		/**
		 * If enabled, open URL as a new tab. Default is true
		 */
		openNewTab?: boolean;
		/**
		 * Color for open link button.
		 * See supported bulma color classes here.
		 * https://bulma.io/documentation/helpers/color-helpers/
		 */
		openButtonColor?: string;
	}

	let {
		value = $bindable(),
		readonly = $bindable(true),
		placeholder = 'Copy to clipboard',
		textCopy = 'Copy',
		textCopied = 'Copied',
		width = $bindable('100%'),
		timeout = 5000,
		isMultiline = false,
		rows = 5,
		size = 'normal',
		openNewTab = true,
		openButtonColor = 'has-text-link'
	}: Props = $props();

	let textCopyButton = $state(textCopy);

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

	const handleFocus = (event) => {
		event.target.select();
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
			onfocus={handleFocus}
			{readonly}
		/>
	{:else}
		<textarea
			data-testid="textarea-control"
			class="textarea is-{size} has-fixed-size"
			{placeholder}
			{rows}
			onfocus={handleFocus}
			{readonly}>{value}</textarea
		>
	{/if}

	<div class="buttons has-addons copy-buttons">
		<button
			class="button {getButtonSize()}"
			use:copy={value}
			onclick={handleCopy}
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
				aria-label="Open link"
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
