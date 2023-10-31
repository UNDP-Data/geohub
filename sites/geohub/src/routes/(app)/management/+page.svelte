<script>
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { CtaLink } from '@undp-data/svelte-undp-design';
</script>

<section class="body-section p-4">
	<h1 class="title">GeoHub Management tools</h1>

	<div class="my-2"><BackToPreviousPage defaultLink="/" /></div>

	<div class="grid">
		<CtaLink href="/management/pgtileserv" label="pg_tileserv management tool" isArrow={true} />

		<CtaLink href="/management/stac" label="STAC management tool" isArrow={true} />
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
