<script lang="ts">
	import { page } from '$app/stores';
	import { Breadcrumbs, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { CtaLink } from '@undp-data/svelte-undp-design';

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-uppercase">{breadcrumbs[breadcrumbs.length - 1].title}</p>
</div>

<section class="body-section ml-6 mr-4 my-4">
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
