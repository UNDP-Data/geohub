<script>
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { CtaLink } from '@undp-data/svelte-undp-design';
</script>

<section class="body-section p-4">
	<div class="my-2"><BackToPreviousPage defaultLink="/management" /></div>

	<h1 class="title">STAC Management tools</h1>

	<div class="grid">
		<CtaLink href="/management/stac/api" label="STAC API management" isArrow={true} />

		<CtaLink href="/management/stac/catalog" label="STAC Catalog management" isArrow={true} />
	</div>
</section>

<style lang="scss">
	.body-section {
		min-height: 30vh;

		.grid {
			display: grid;
			grid-template-columns: repeat(1, 1fr);
			gap: 1rem;
		}
	}
</style>
