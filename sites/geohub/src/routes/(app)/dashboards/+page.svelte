<script lang="ts">
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import DashboardsExplorer from './DashboardsExplorer.svelte';

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'dashboards', url: $page.url.href }
	]);
</script>

<HeroHeader title="Explore dashboards" bind:breadcrumbs />

<section class="solution-section">
	<h2 class="title is-2">Discover geospatial solutions</h2>
	<p class="description is-size-4">
		Leverage dashboards and geospatial tools for{'\u00A0'}informed decision-making
	</p>

	<DashboardsExplorer />
</section>

<style lang="scss">
	.solution-section {
		margin: 64px 48px;

		@media (max-width: 48em) {
			margin: 16px 48px;

			@media (max-width: 48em) {
				margin: 48px 0;

				.title {
					margin: 0 24px;
				}

				.description {
					margin: 0 24px;
				}
			}
		}

		.title {
			line-height: 109%;
		}

		.description {
			margin-bottom: 32px;
		}
	}
</style>
