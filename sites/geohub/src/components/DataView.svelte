<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import DataCard from '$components/data-view/DataCard.svelte';
	import DataCategoryCardList from '$components/data-view/DataCategoryCardList.svelte';
	import TextFilter from '$components/data-view/TextFilter.svelte';
	// import { getSelectedTagsFromUrl } from '$lib/helper';
	import type { DatasetFeatureCollection } from '$lib/types';
	// import type { Tag } from '$lib/types/Tag';
	import { map } from '$stores';
	import { Breadcrumbs, Loader, type Breadcrumb } from '@undp-data/svelte-undp-design';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import Help from './Help.svelte';
	// import SelectedTags from './data-view/SelectedTags.svelte';

	let dataCategories: Breadcrumb[] = $page.data.menu;
	let isLoading = false;

	export let contentHeight: number;
	let optionsHeight = 41.5;

	$: totalHeight = contentHeight - optionsHeight;

	let containerDivElement: HTMLDivElement;

	let query = $page.url.searchParams.get('query') ?? '';
	// let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url);

	let DataItemFeatureCollection: DatasetFeatureCollection = $page.data.features;

	let isFavouriteSearch = false;

	let breadcrumbs: Breadcrumb[] = $page.data.breadcrumbs;

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}

	const fetchNextDatasets = async (url: string) => {
		try {
			// change cursor and disable scroll
			containerDivElement.style.cursor = 'wait';
			containerDivElement.style.overflowY = 'hidden';

			const res = await fetch(url);
			const json: DatasetFeatureCollection = await res.json();
			if (json.features.length > 0) {
				json.features = [...DataItemFeatureCollection.features, ...json.features];
			}
			DataItemFeatureCollection = json;
		} finally {
			containerDivElement.style.cursor = '';
			containerDivElement.style.overflowY = 'auto';
		}
	};

	const handleCategorySelected = async (e) => {
		try {
			isLoading = true;
			const category = e.detail.category;
			const apiUrl = $page.url;
			const breadcrumbsValue = apiUrl.searchParams.get('breadcrumbs');
			const bcs = breadcrumbsValue ? breadcrumbsValue.split(',') : ['Home'];
			bcs.push(category.name);
			apiUrl.searchParams.set('breadcrumbs', bcs.join(','));

			if (category.url.startsWith('/api/datasets')) {
				const apiUrl = $page.url;
				const categoryUrl = new URL(`${$page.url.origin}${$page.url.pathname}${category.url}`);
				for (const key of categoryUrl.searchParams.keys()) {
					const value = categoryUrl.searchParams.get(key);
					if (apiUrl.searchParams.get(key) !== value) {
						apiUrl.searchParams.set(key, value);
					}
				}
				await reload(apiUrl.toString());
			} else {
				history.replaceState({}, null, apiUrl.toString());
				await invalidateAll();
				dataCategories = $page.data.menu;
			}
		} finally {
			isLoading = false;
		}
	};

	const handleTagChanged = async (e) => {
		const apiUrl = $page.url;
		const isReload = e.detail.reload ?? true;
		await reload(apiUrl.toString(), isReload);
	};

	const handleFilterChanged = async (e) => {
		const url = e.detail.url;
		await reload(url, true);
	};

	const reload = async (url: string, isLoad = true) => {
		try {
			isLoading = true;

			const datasetUrl = new URL(url);
			const apiUrl = `${$page.url.origin}${$page.url.pathname}${datasetUrl.search}`;

			if (isLoad) {
				history.replaceState({}, null, apiUrl.toString());
				await invalidateAll();
			}
			// selectedTags = getSelectedTagsFromUrl(new URL(apiUrl));
			breadcrumbs = $page.data.breadcrumbs;
			dataCategories = $page.data.menu;
			DataItemFeatureCollection = $page.data.features;
		} finally {
			isLoading = false;
		}
	};

	const handleBreadcrumpClicked = async (e) => {
		const index: number = e.detail.index;
		const breadcrump: Breadcrumb = e.detail.breadcrumb;

		clearFiltertext();
		clearDatasets();
		isFavouriteSearch = false;

		let apiUrl = $page.url;
		apiUrl.searchParams.delete('query');
		apiUrl.searchParams.delete('sdg_goal');
		apiUrl.searchParams.delete('type');
		apiUrl.searchParams.delete('provider');
		apiUrl.searchParams.delete('stac');
		apiUrl.searchParams.delete('staronly');
		apiUrl.searchParams.delete('mydata');
		apiUrl.searchParams.delete('continent');
		apiUrl.searchParams.delete('region');
		apiUrl.searchParams.delete('country');
		apiUrl.searchParams.delete('extent');

		if (index === 0) {
			// home
			apiUrl.searchParams.delete('breadcrumbs');
			// apiUrl = clearSelectedTags(apiUrl);
			apiUrl.searchParams.set('breadcrumbs', 'Home');
		} else if (index < breadcrumbs.length - 1) {
			// middle ones
			let last = breadcrumbs[breadcrumbs.length - 1];
			while (last.name !== breadcrump.name) {
				breadcrumbs.pop();
				last = breadcrumbs[breadcrumbs.length - 1];
			}
			breadcrumbs = [...breadcrumbs];

			apiUrl.searchParams.delete('breadcrumbs');
			apiUrl.searchParams.set('breadcrumbs', breadcrumbs.map((b) => b.name).join(','));
		}

		expanded = {};
		try {
			isLoading = true;
			history.replaceState({}, null, apiUrl.toString());
			await invalidateAll();
			dataCategories = $page.data.menu;
			breadcrumbs = $page.data.breadcrumbs;
		} finally {
			isLoading = false;
		}
	};

	// const clearSelectedTags = (url: URL) => {
	// 	TagSearchKeys.forEach((key) => {
	// 		url.searchParams.delete(key.key);
	// 	});
	// 	selectedTags = [];
	// 	return url;
	// };

	let clearFiltertext = () => {
		query = '';
	};

	let clearDatasets = () => {
		DataItemFeatureCollection = undefined;
	};
</script>

<div class="container mx-4" bind:clientHeight={optionsHeight}>
	<TextFilter
		placeholder="Type keywords to search data"
		bind:map={$map}
		bind:query
		disabled={isLoading}
		on:tagchange={handleTagChanged}
		on:change={handleFilterChanged}
	/>

	<Breadcrumbs
		bind:breadcrumbs
		disabled={isLoading}
		on:clicked={handleBreadcrumpClicked}
		fontSize="medium"
	/>

	<div class="help">
		<Help>
			<div>
				<p>To explore and create your own maps, click on the following menus!</p>
				<p>The <b>SDG</b> menu allows you to explore data on Sustainable Development Goals.</p>
				<p>The <b>Continent</b> menu will enable you to search data by country.</p>
				<p>
					<b>Microsoft Planetary</b> allows satellite imagery exploration, and the
					<b>Dynamic vector data</b> allows advanced simulations.
				</p>
			</div>
		</Help>
	</div>

	<!-- {#key selectedTags}
		<SelectedTags on:change={handleTagChanged} isClearButtonShown={true} />
	{/key} -->

	{#if DataItemFeatureCollection && DataItemFeatureCollection.features?.length > 0}
		{@const dsText =
			DataItemFeatureCollection.features.length > 1 ? 'datasets were ' : 'dataset was '}
		<Notification type="info">
			{DataItemFeatureCollection.features.length} / {DataItemFeatureCollection.pages.totalCount}
			{dsText}loaded.
		</Notification>
	{/if}
</div>
<div
	class="container data-view-container mx-4"
	style="height: {totalHeight}px;"
	bind:this={containerDivElement}
>
	{#if isLoading}
		<div class="loader-container">
			<Loader size="medium" />
		</div>
	{:else if DataItemFeatureCollection && DataItemFeatureCollection.features?.length > 0}
		{#each DataItemFeatureCollection.features as feature}
			<DataCard
				{feature}
				bind:isExpanded={expanded[feature.properties.id]}
				bind:isStarOnly={isFavouriteSearch}
			/>
		{/each}
		<InfiniteScroll
			threshold={100}
			on:loadMore={async () => {
				const link = DataItemFeatureCollection?.links.find((l) => l.rel === 'next');
				if (link) {
					await fetchNextDatasets(link.href);
				}
			}}
		/>
	{:else if DataItemFeatureCollection && DataItemFeatureCollection.features?.length === 0}
		{#if isFavouriteSearch}
			<Notification type="info"
				>No favourite dataset. Please add dataset to favourite by clicking star button.</Notification
			>
		{:else}
			<Notification type="warning">No data found. Try another keyword.</Notification>
		{/if}
		<!-- {:else if isLoading}
		<div class="loader-container">
			<Loader size="medium" />
		</div> -->
	{:else if dataCategories}
		<DataCategoryCardList
			categories={dataCategories}
			cardSize="medium"
			on:selected={handleCategorySelected}
			bind:breadcrumbs
		/>
	{/if}
</div>

<style lang="scss">
	.help {
		position: absolute;
		top: 50px;
		right: 0px;
	}

	.data-view-container {
		overflow-y: auto;
		.loader-container {
			width: max-content;
			margin: auto;
		}
	}
</style>
