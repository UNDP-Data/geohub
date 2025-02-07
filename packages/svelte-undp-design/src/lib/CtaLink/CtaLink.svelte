<script lang="ts">
	interface Props {
		label: string;
		isArrow?: boolean;
		href?: string;
		target?: string;
		onclick?: () => void;
	}

	let { label, isArrow = true, href = '', target = '', onclick = () => {} }: Props = $props();

	const handleClicked = () => {
		if (onclick) onclick();
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

{#if href}
	<a class="cta__link {isArrow ? 'cta--arrow' : 'cta--space'}" role="button" {href} {target}>
		{label}
		<i></i>
	</a>
{:else}
	<!-- svelte-ignore a11y_missing_attribute -->
	<a
		class="cta__link {isArrow ? 'cta--arrow' : 'cta--space'}"
		role="button"
		tabindex="0"
		onkeydown={handleKeyDown}
		onclick={handleClicked}
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off"
	>
		{label}
		<i></i>
	</a>
{/if}

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
</style>
