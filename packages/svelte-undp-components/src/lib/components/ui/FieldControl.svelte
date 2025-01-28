<script lang="ts">
	import Help from '$lib/components/ui/Help.svelte';
	interface Props {
		title: string;
		showHelp?: boolean;
		showHelpPopup?: boolean;
		marginBottom?: string;
		fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
		isFirstCharCapitalized?: boolean;
		iconType?: 'info' | 'help';
		help?: import('svelte').Snippet;
		control?: import('svelte').Snippet;
	}

	let {
		title = $bindable(),
		showHelp = $bindable(true),
		showHelpPopup = $bindable(true),
		marginBottom = $bindable(''),
		fontWeight = $bindable('normal'),
		isFirstCharCapitalized = $bindable(true),
		iconType = $bindable('info'),
		help,
		control
	}: Props = $props();
</script>

<div class="field" style={marginBottom ? `margin-bottom: ${marginBottom}` : ''}>
	<label class="label is-normal is-flex is-align-items-center">
		<span
			class="is-size-6 {isFirstCharCapitalized
				? 'first-char-capitalized'
				: ''} has-text-weight-{fontWeight}">{title}</span
		>
		{#if showHelpPopup && showHelp}
			<Help type={iconType}>
				{@render help?.()}
			</Help>
		{/if}
	</label>
	<div class="control">
		{@render control?.()}
		{#if !showHelpPopup && showHelp}
			<div class="help font-size has-text-grey-darker is-size-7 has-text-weight-normal mt-2">
				{@render help?.()}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.first-char-capitalized {
		text-transform: lowercase;
	}
	.first-char-capitalized::first-letter {
		text-transform: capitalize;
	}

	.font-size {
		font-size: 0.875rem;
	}
</style>
