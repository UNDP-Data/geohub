<script lang="ts">
	import Help from '$lib/components/Help.svelte';
	export let title: string;
	export let showHelp = true;
	export let showHelpPopup = true;
	export let marginBottom: string = '';
	export let fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' = 'normal';
	export let isFirstCharCapitalized = true;
</script>

<div class="field" style={marginBottom ? `margin-bottom: ${marginBottom}` : ''}>
	<label class="label is-normal is-flex is-align-items-center">
		<span
			class="is-size-6 {isFirstCharCapitalized
				? 'first-char-capitalized'
				: ''} has-text-weight-{fontWeight}">{title}</span
		>
		{#if showHelpPopup && showHelp}
			<Help>
				<slot name="help" />
			</Help>
		{/if}
	</label>
	<div class="control">
		<slot name="control" />
		{#if !showHelpPopup && showHelp}
			<p class="help font-size has-text-grey-darker is-size-7 has-text-weight-normal mt-2">
				<slot name="help" />
			</p>
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
