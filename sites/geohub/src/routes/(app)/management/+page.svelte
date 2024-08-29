<script lang="ts">
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { CtaLink } from '@undp-data/svelte-undp-design';

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: $page.url.href }
	];
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="body-section m-6">
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
