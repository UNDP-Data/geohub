<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import DataCategoryCardList from '$components/pages/map/data/DataCategoryCardList.svelte';
	import TextFilter from '$components/pages/map/data/TextFilter.svelte';
	import { DataCategories } from '$lib/config/AppConfig';
	import type { DatasetFeatureCollection } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Notification, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { Loader, type Breadcrumb } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import DataCard from './DataCard.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	let isLoading = false;

	export let contentHeight: number;
	let optionsHeight = 41.5;

	$: totalHeight = contentHeight - optionsHeight;

	let containerDivElement: HTMLDivElement;

	let query = $page.url.searchParams.get('query') ?? '';

	let DataItemFeatureCollection: DatasetFeatureCollection;

	let isFavouriteSearch = false;

	let bcQuery = $page.url.searchParams.get('breadcrumbs') ?? 'Home';
	let breadcrumbs: Breadcrumb[] = bcQuery.split(',').map((b) => {
		return { name: b, url: '', icon: '' };
	});
	const excludedMenu = ['Favourite', 'My data'];

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

			for (let i = 0; i < breadcrumbs.length; i++) {
				if (breadcrumbs[i].name === category.name) {
					breadcrumbs[i] = category;
				}
			}

			if (category.url.startsWith('/api/datasets')) {
				const apiUrl = new URL(
					`/api/datasets${$page.url.search}${$page.url.hash}`,
					$page.url.origin
				);
				const categoryUrl = new URL(`${$page.url.origin}${$page.url.pathname}${category.url}`);
				for (const key of categoryUrl.searchParams.keys()) {
					const value = categoryUrl.searchParams.get(key);
					if (apiUrl.searchParams.get(key) !== value) {
						apiUrl.searchParams.set(key, value);
						$page.url.searchParams.set(key, value);
					}
				}
				replaceState($page.url, '');
				await reload(apiUrl.toString());
			} else {
				await goto(apiUrl, {
					invalidateAll: true,
					replaceState: true
				});
			}
		} finally {
			isLoading = false;
		}
	};

	const handleTagChanged = async (e) => {
		const url = new URL(e.detail.url);
		const apiUrl = new URL(`/api/datasets${url.search}${url.hash}`, $page.url.origin);
		await reload(apiUrl.href);
	};

	const handleFilterChanged = async (e) => {
		clearDatasets();
		const url = new URL(e.detail.url);
		replaceState(url, '');
		if (breadcrumbs.length <= 1 && query?.length === 0) {
			return;
		}

		const apiUrl = new URL(`/api/datasets${url.search}${url.hash}`, $page.url.origin);
		await reload(apiUrl.href);
	};

	const reload = async (url: string) => {
		try {
			isLoading = true;

			const res = await fetch(url);
			DataItemFeatureCollection = await res.json();
		} finally {
			isLoading = false;
		}
	};

	const handleBreadcrumpClicked = async (breadcrump: Breadcrumb) => {
		if (isLoading) return;
		const index: number = breadcrumbs.findIndex((b) => b.name === breadcrump.name);

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
			apiUrl.searchParams.set('breadcrumbs', 'Home');
			breadcrumbs = [breadcrumbs[0]];
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

		replaceState(apiUrl, '');
		const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1].name;
		const category = DataCategories.find((c) => c.name === lastBreadcrumb);
		if (lastBreadcrumb === 'Home' || (category && !category.url.startsWith('/api/datasets'))) {
			return;
		}
		const url = new URL(`/api/datasets${apiUrl.search}${apiUrl.hash}`, apiUrl.origin);
		await reload(url.href);
	};

	let clearFiltertext = () => {
		query = '';
		const url = $page.url;
		url.searchParams.delete('query');
		replaceState(url, '');
	};

	let clearDatasets = () => {
		DataItemFeatureCollection = undefined;
	};

	const getMenuItems = async () => {
		const res = await fetch(`/api/menu?breadcrumbs=${breadcrumbs.map((b) => b.name)}`);
		const json = await res.json();
		return json.items as Breadcrumb[];
	};

	const isDatasetLoading = () => {
		const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
		let category = DataCategories.find((c) => c.name === lastBreadcrumb.name);
		if (!category) {
			category = lastBreadcrumb;
		}

		if (query?.length > 0) {
			return true;
		} else {
			if (
				lastBreadcrumb.name === 'Home' ||
				(category && !category.url.startsWith('/api/datasets'))
			) {
				return false;
			}
			return true;
		}
	};

	onMount(() => {
		if (isDatasetLoading()) {
			const url = new URL(`/api/datasets${$page.url.search}${$page.url.hash}`, $page.url.origin);
			reload(url.href);
		}
	});
</script>

<div bind:clientHeight={optionsHeight}>
	<TextFilter
		placeholder="Type keywords to search data"
		bind:map={$map}
		bind:query
		disabled={isLoading}
		on:tagchange={handleTagChanged}
		on:change={handleFilterChanged}
	/>

	<div class="my-2 ml-1 mr-2">
		<nav class="breadcrumb has-text-weight-bold" aria-label="breadcrumbs">
			<ul>
				{#each breadcrumbs as page, index}
					<li class={index === breadcrumbs.length - 1 ? 'is-active' : ''}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class={isLoading ? 'disabled' : ''}
							role="button"
							tabindex="0"
							on:click={() => {
								if (index === breadcrumbs.length - 1) return;
								handleBreadcrumpClicked(page);
							}}
							on:keydown={handleEnterKey}
							data-sveltekit-preload-data="off"
							data-sveltekit-preload-code="off"
						>
							<span>{page.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

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
	class="container data-view-container pb-5"
	style="height: {totalHeight}px;"
	bind:this={containerDivElement}
>
	{#each breadcrumbs as page, index}
		{#if index === breadcrumbs.length - 1}
			{#if isDatasetLoading() || query?.length > 0}
				{#if isLoading}
					<div class="is-flex is-justify-content-center">
						<Loader size="medium" />
					</div>
				{:else if DataItemFeatureCollection && (excludedMenu.includes(page.name) || !excludedMenu.includes(page.name))}
					{#if DataItemFeatureCollection.features?.length === 0}
						<Notification type={isFavouriteSearch ? 'info' : 'warning'}>
							No dataset found.
							{#if isFavouriteSearch}
								Please add dataset to favourite by clicking star button.
							{:else}
								Try another keyword.
							{/if}
						</Notification>
					{:else}
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
					{/if}
				{/if}
			{:else}
				{#await getMenuItems()}
					<div class="is-flex is-justify-content-center">
						<Loader size="medium" />
					</div>
				{:then items}
					<DataCategoryCardList
						categories={items}
						on:selected={handleCategorySelected}
						bind:breadcrumbs
					/>
				{/await}
			{/if}
		{/if}
	{/each}
</div>

<style lang="scss">
	.data-view-container {
		overflow-y: auto;
	}

	.disabled {
		color: currentColor;
		cursor: not-allowed;
		opacity: 0.5;
		text-decoration: none;
	}
</style>
