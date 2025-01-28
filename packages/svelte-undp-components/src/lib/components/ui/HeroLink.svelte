<script lang="ts">
	import { Button } from '@undp-data/svelte-undp-design';

	interface Props {
		title: string;
		linkName: string;
		href: string;
		size?: 'small' | 'normal' | 'medium' | 'large';
		isArrow?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		title = $bindable(),
		linkName = $bindable(),
		href = $bindable(),
		size = $bindable('normal'),
		isArrow = $bindable(true),
		children
	}: Props = $props();
</script>

<section class="hero is-{size} has-background-grey-darker mt-6">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">{title}</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			{@render children?.()}
		</p>

		<div class="cta-button mt-4 mx-auto">
			<Button title={linkName} {isArrow} bind:href />
		</div>
	</div>
</section>

<style lang="scss">
	.hero-body {
		padding: 96px 144px;

		@media (max-width: 48em) {
			padding: 96px 24px;
		}

		.cta-button {
			width: fit-content;
		}
	}
</style>
