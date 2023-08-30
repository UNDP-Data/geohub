<script lang="ts">
	import DataCategoryCard from '$components/data-view/DataCategoryCard.svelte';
	import type { Breadcrumb } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let categories: Breadcrumb[];
	export let cardSize: 'medium' | 'small' = 'medium';
	export let breadcrumbs: Breadcrumb[];

	onMount(async () => {
		if (!(breadcrumbs && breadcrumbs.length > 0)) return;
		const breadcrumbCount = breadcrumbs.length;
		if (breadcrumbCount > 1) {
			const lastCategory = breadcrumbs[breadcrumbCount - 1];
			if (
				!lastCategory.url.startsWith('/api/datasets') &&
				categories.find((c) => c.name === lastCategory.name)
			) {
				getSelectedCategory(lastCategory);
			}
		}
	});

	const getSelectedCategory = (category: Breadcrumb) => {
		if (breadcrumbs && breadcrumbs.length > 0) {
			const lastCategory = breadcrumbs[breadcrumbs.length - 1];
			if (lastCategory?.name !== category.name) {
				breadcrumbs = [...breadcrumbs, category];
			}
		}
		dispatch('selected', { category });
	};
</script>

<div
	class="container mt-2 category-container"
	style="grid-template-columns: repeat(auto-fit, minmax({cardSize === 'medium' ? 80 : 70}px, 1fr))"
>
	{#each categories as category}
		<DataCategoryCard
			bind:category
			size={cardSize}
			on:clicked={() => {
				getSelectedCategory(category);
			}}
		/>
	{/each}
</div>

<style lang="scss">
	.category-container {
		display: grid;
		grid-gap: 5px;
	}
</style>
