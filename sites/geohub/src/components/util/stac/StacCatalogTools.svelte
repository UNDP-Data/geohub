<script context="module" lang="ts">
	interface ToolBreadcrumb extends BreadcrumbPage {
		type: 'index' | 'tool';
	}
</script>

<script lang="ts">
	import RasterAlgorithmExplorer from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import type { DatasetFeature, RasterAlgorithm, StacCollection, Tag } from '$lib/types';
	import {
		Breadcrumbs,
		FieldControl,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import StacCatalogDatePicker from './StacCatalogDatePicker.svelte';

	export let collectionUrl: string;
	export let collection: StacCollection;
	export let dataset: DatasetFeature = undefined;

	let selectedTool: { algorithmId: string; algorithm: RasterAlgorithm };

	let breadcrumbs: ToolBreadcrumb[] = [
		{
			title: 'Tool Menu',
			type: 'index'
		}
	];

	const handleToolSelected = (e) => {
		const tag: Tag = e.detail.tag;
		const algorithm: RasterAlgorithm = e.detail.algorithm;
		selectedTool = {
			algorithmId: tag.value,
			algorithm
		};
		breadcrumbs = [
			...breadcrumbs,
			{
				title: algorithm.title ?? selectedTool.algorithmId,
				type: 'tool'
			}
		];
	};

	const handleBreadcrumbClicked = (e) => {
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
					on:selected={handleToolSelected}
				/>
			{:else if page.type === 'tool'}
				{#if selectedTool}
					<FieldControl title="Select input data" showHelpPopup={false}>
						<div slot="control">
							{#each [1, selectedTool.algorithm.inputs.nbands] as bandNo}
								<div class="field">
									<!-- svelte-ignore a11y-label-has-associated-control -->
									<label class="label">Input Band {bandNo}</label>
									<div class="control">
										<StacCatalogDatePicker bind:collectionUrl bind:collection />
									</div>
								</div>
							{/each}
						</div>
						<div slot="help">{selectedTool.algorithm.description}</div>
					</FieldControl>
				{/if}
			{/if}
		</div>
	{/each}
{/if}
