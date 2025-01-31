<!-- https://design.undp.org/?path=/docs/components-ui-components-buttons-buttons--buttons -->
<script lang="ts">
	interface Props {
		title?: string;
		isArrow?: boolean;
		isPrimary?: boolean;
		isDisabled?: boolean;
		isDownload?: boolean;
		isExternalLink?: boolean;
		href?: string;
		onclick?: () => void;
	}

	let {
		title = '',
		isArrow = false,
		isPrimary = true,
		isDisabled = false,
		isDownload = false,
		isExternalLink = false,
		href = $bindable(''),
		onclick = () => {}
	}: Props = $props();

	const handleClicked = () => {
		if (!isDisabled) {
			if (onclick) onclick();
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!isDisabled && event.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			event.target.click();
		}
	};
</script>

{#if href}
	<a
		class="button button-{isPrimary ? 'primary' : 'secondary'} {isArrow
			? 'button-arrow'
			: isDownload
				? 'button-download'
				: isExternalLink
					? 'button-external-link'
					: 'button-without-arrow'}"
		class:disabled={isDisabled}
		role="button"
		{href}
	>
		{title}
		{#if isDownload}
			<span class="download-animated"><i></i></span>
		{:else if isExternalLink}
			<span class="external-link-animated"><i></i></span>
		{/if}
	</a>
{:else}
	<!-- svelte-ignore a11y_missing_attribute -->
	<a
		class="button button-{isPrimary ? 'primary' : 'secondary'} {isArrow
			? 'button-arrow'
			: isDownload
				? 'button-download'
				: isExternalLink
					? 'button-external-link'
					: 'button-without-arrow'}"
		class:disabled={isDisabled}
		role="button"
		alt={title}
		tabindex="0"
		onkeydown={handleKeyDown}
		onclick={handleClicked}
	>
		{title}
		{#if isDownload}
			<span class="download-animated"><i></i></span>
		{:else if isExternalLink}
			<span class="external-link-animated"><i></i></span>
		{/if}
	</a>
{/if}

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
