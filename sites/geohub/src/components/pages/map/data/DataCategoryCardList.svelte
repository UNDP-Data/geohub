<script lang="ts">
	import DataCategoryCard from '$components/pages/map/data/DataCategoryCard.svelte';
	import type { Breadcrumb } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';

	interface Props {
		categories: Breadcrumb[];
		breadcrumbs: Breadcrumb[];
		onselect?: (category: Breadcrumb) => void;
	}

	let {
		categories = $bindable(),
		breadcrumbs = $bindable(),
		onselect = (category) => {
			console.log(category);
		}
	}: Props = $props();

	onMount(() => {
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
		if (onselect) {
			onselect(category);
		}
	};
</script>

<div
	class="container mt-2 category-container"
	style="grid-template-columns: repeat(auto-fit, minmax(80px, 1fr))"
>
	{#each categories as category (categories.indexOf(category))}
		<DataCategoryCard
			{category}
			onclick={() => {
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
