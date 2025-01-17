<script module lang="ts">
	interface ToolBreadcrumb extends BreadcrumbPage {
		type: 'index' | 'tool';
	}
</script>

<script lang="ts">
	import RasterAlgorithmExplorer from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import type { DatasetFeature, StacCollection, StacDataLayer, Tag } from '$lib/types';
	import {
		Breadcrumbs,
		type BreadcrumbPage,
		type RasterAlgorithm
	} from '@undp-data/svelte-undp-components';
	import StacCatalogTool from './StacCatalogTool.svelte';

	interface Props {
		collectionUrl: string;
		collection: StacCollection;
		dataset?: DatasetFeature;
		onDataAdded?: (layers: StacDataLayer[]) => void;
	}

	let {
		collectionUrl = $bindable(),
		collection = $bindable(),
		dataset = $bindable(undefined),
		onDataAdded = () => {}
	}: Props = $props();

	let selectedTool: { algorithmId: string; algorithm: RasterAlgorithm } | undefined = $state();

	let breadcrumbs: ToolBreadcrumb[] = $state([
		{
			title: 'Tool Menu',
			type: 'index'
		}
	]);

	const handleToolSelected = (tag: Tag, algorithm: RasterAlgorithm) => {
		selectedTool = {
			algorithmId: tag.value as string,
			algorithm
		};
		breadcrumbs = [
			...breadcrumbs,
			{
				title: algorithm.title ?? (selectedTool?.algorithmId as string),
				type: 'tool'
			}
		];
	};

	const handleBreadcrumbClicked = (e: { detail: ToolBreadcrumb }) => {
		const page: ToolBreadcrumb = e.detail;
		if (breadcrumbs?.length > 0) {
			const pageIndex = breadcrumbs.findIndex((p) => p.title === page.title);
			breadcrumbs = [...breadcrumbs.slice(0, pageIndex + 1)];
		}
	};
</script>

{#if breadcrumbs && breadcrumbs.length > 0}
	<Breadcrumbs bind:pages={breadcrumbs} size="small" on:click={handleBreadcrumbClicked} />
{/if}

{#if dataset}
	{#each breadcrumbs as page, index}
		{@const isLastPage = index === breadcrumbs.length - 1}
		<div hidden={!isLastPage}>
			{#if page.type === 'index'}
				<RasterAlgorithmExplorer
					bind:feature={dataset}
					mode="select"
					toggleTool={false}
					onSelected={handleToolSelected}
				/>
			{:else if page.type === 'tool'}
				<StacCatalogTool
					bind:collection
					bind:collectionUrl
					bind:dataset
					bind:selectedTool={selectedTool as { algorithmId: string; algorithm: RasterAlgorithm }}
					{onDataAdded}
				/>
			{/if}
		</div>
	{/each}
{/if}
