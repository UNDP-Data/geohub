<script lang="ts">
	import { Button } from '@undp-data/svelte-undp-design';

	export let title: string;
	export let linkName: string;
	export let href: string;
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';
	export let isArrow = true;
</script>

<section class="hero is-{size} has-background-grey-darker mt-6">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">{title}</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			<slot />
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
