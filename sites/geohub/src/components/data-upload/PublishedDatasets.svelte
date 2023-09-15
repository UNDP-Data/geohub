<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import PanelButton from '$components/controls/PanelButton.svelte';
	import TagFilter from '$components/data-view/TagFilter.svelte';
	import { DatasetSortingColumns, LimitOptions } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { handleEnterKey } from '$lib/helper';
	import type { DatasetFeature, DatasetFeatureCollection, Tag } from '$lib/types';
	import { Loader, Pagination, Radios } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import PublishedDatasetHeader from './PublishedDatasetHeader.svelte';
	import PublishedDatasetRow from './PublishedDatasetRow.svelte';
	import SdgCard from './SdgCard.svelte';
	import SdgPicker from './SdgPicker.svelte';
	const dispatch = createEventDispatcher();

	export let datasets: Promise<DatasetFeatureCollection>;
	let featureCollection: DatasetFeatureCollection;

	$: datasets, updateFeatureCollection();
	const updateFeatureCollection = () => {
		datasets.then((res) => {
			featureCollection = res;
		});
	};
	updateFeatureCollection();

	let expanded: { [key: string]: boolean } = {};
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

	let isLoading = false;

	const config: UserConfig = $page.data.config;

	let limit = $page.url.searchParams.get('limit') ?? `${config.DataPageSearchLimit}`;
	let offset = $page.url.searchParams.get('offset') ?? 0;
	let sortby = $page.url.searchParams.get('sortby') ?? config.DataPageSortingColumn;
	let query = $page.url.searchParams.get('query') ?? '';
	let queryType: 'and' | 'or' =
		($page.url.searchParams.get('queryoperator') as 'and' | 'or') ??
		config.DataPageSearchQueryOperator;
	let isTagFilterShow = false;

	let showMyData = $page.url.searchParams.get('mydata') === 'true' ? true : false;
	let showFavourite = $page.url.searchParams.get('staronly') === 'true' ? true : false;

	const getSDGsFromUrl = () => {
		const key = 'sdg_goal';
		const sdgs = $page.url.searchParams.getAll(key);
		const tags: Tag[] = [];
		sdgs?.forEach((value) => {
			tags.push({
				key,
				value
			});
		});
		return tags;
	};

	export let selectedSDGs: Tag[] = getSDGsFromUrl();

	$: isQueryEmpty = !query || query?.length === 0;

	const reload = async (url: URL) => {
		try {
			isLoading = true;
			await goto(`?${url.searchParams.toString()}`, {
				invalidateAll: true,
				noScroll: true
			});
			dispatch('change');
		} finally {
			isLoading = false;
		}
	};

	const handleFilterInput = debounce(async (e) => {
		query = (e.target as HTMLInputElement).value;
		if (query.length > 0) {
			offset = '0';

			const link = featureCollection.links.find((l) => l.rel === 'self');
			if (link) {
				const href = new URL(link.href);
				href.searchParams.set('query', query.trim());
				href.searchParams.set('queryoperator', queryType);
				href.searchParams.set('offset', offset);
				await reload(href);
			}
		}
	}, 500);

	const clearInput = async () => {
		if (isQueryEmpty === true) return;
		query = '';
		offset = '0';
		const link = featureCollection.links.find((l) => l.rel === 'self');
		if (link) {
			const href = new URL(link.href);
			href.searchParams.delete('query');
			href.searchParams.set('offset', offset);
			await reload(href);
		}
	};

	const handleLimitChanged = async () => {
		const currentLimit = $page.url.searchParams.get('limit')
			? $page.url.searchParams.get('limit')
			: `${config.DataPageSearchLimit}`;
		if (currentLimit && currentLimit !== limit) {
			offset = '0';

			const link = featureCollection.links.find((l) => l.rel === 'self');
			if (link) {
				const href = new URL(link.href);
				href.searchParams.set('limit', limit);
				href.searchParams.set('offset', offset);
				await reload(href);
			}
		}
	};

	const handleTagChanged = async () => {
		dispatch('change');
	};

	const handleSortbyChanged = async () => {
		offset = '0';

		const link = featureCollection.links?.find((l) => l.rel === 'self');
		if (link) {
			const href = new URL(link.href);
			href.searchParams.set('sortby', sortby);
			href.searchParams.set('offset', offset);
			await reload(href);
		}
	};

	const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
		const type = e.detail.type;

		const link = featureCollection.links.find((l) => l.rel === type);
		if (link) {
			const href = new URL(link.href);
			await reload(href);
		}
	};

	const handleDeleted = async (e) => {
		const deletedFeature: DatasetFeature = e.detail.feature;
		const index = featureCollection.features.findIndex(
			(f) => f.properties.id === deletedFeature.properties.id
		);
		if (index > -1) {
			featureCollection.features.splice(index, 1);
			featureCollection.features = [...featureCollection.features];
		}
		await invalidateAll();
		dispatch('change');
	};

	const handleMyDataChanged = async () => {
		showMyData = !showMyData;

		const href = new URL($page.url);

		href.searchParams.delete('limit');
		href.searchParams.delete('offset');

		if (showMyData) {
			href.searchParams.set('mydata', 'true');
		} else {
			href.searchParams.delete('mydata');
		}

		await reload(href);
	};

	const handleFavouriteChanged = async () => {
		showFavourite = !showFavourite;

		const href = new URL($page.url);

		href.searchParams.delete('limit');
		href.searchParams.delete('offset');

		if (showFavourite) {
			href.searchParams.set('staronly', 'true');
		} else {
			href.searchParams.delete('staronly');
		}

		await reload(href);
	};

	const updateSDGtags = async () => {
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('sdg_goal');
		selectedSDGs?.forEach((t) => {
			apiUrl.searchParams.append(t.key, t.value);
		});

		await reload(apiUrl);
	};

	const handleSDGtagChanged = async (e) => {
		selectedSDGs = e.detail.tags;
		selectedSDGs = [...selectedSDGs];
		await updateSDGtags();
	};

	const handleSDGDeleted = async (e) => {
		const sdg = e.detail.sdg;
		const filtered = selectedSDGs.filter((t) => t.value !== `${sdg}`);
		selectedSDGs = [...filtered];
		await updateSDGtags();
	};
</script>

<div class="datasets-header mb-4">
	<div class="columns">
		{#if $page.data.session}
			<div class="column px-0 py-1">
				<div class="field has-addons">
					<p class="control">
						<button
							class="button {showMyData ? 'is-primary' : 'is-primary is-light'}"
							on:click={handleMyDataChanged}
						>
							<span class="icon is-small">
								<i class="fas fa-user"></i>
							</span>
							<span>My data</span>
						</button>
					</p>
					<p class="control">
						<button
							class="button {showFavourite ? 'is-primary' : 'is-primary is-light'}"
							on:click={handleFavouriteChanged}
						>
							<span class="icon is-small">
								<i class="fas fa-star"></i>
							</span>
							<span>Favourites</span>
						</button>
					</p>
				</div>
			</div>
		{/if}
		<div class="column px-0 py-1 mr-4">
			<div class="is-flex is-justify-content-end is-align-items-center">
				<div class="control has-icons-left filter-text-box pl-1">
					<input
						data-testid="filter-bucket-input"
						class="input"
						type="text"
						placeholder="Type keywords"
						on:input={handleFilterInput}
						bind:value={query}
					/>
					<span class="icon is-small is-left">
						<i class="fas fa-search" />
					</span>
					{#if !isQueryEmpty}
						<div
							class="clear-button"
							role="button"
							tabindex="0"
							on:click={clearInput}
							on:keydown={handleEnterKey}
						>
							<i class="fas fa-xmark sm" />
						</div>
					{/if}
				</div>
				<div class="field px-1 m-0 pb-1">
					<SdgPicker
						bind:tags={selectedSDGs}
						size="small"
						showSelectionOnButton={false}
						on:change={handleSDGtagChanged}
					/>
				</div>
				<div class="field tag-filter m-0">
					<PanelButton
						icon="fas fa-sliders"
						tooltip="Explore tags and filter data"
						bind:isShow={isTagFilterShow}
						width="300px"
					>
						<p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
						<p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
						<TagFilter bind:isShow={isTagFilterShow} on:change={handleTagChanged} />
					</PanelButton>
				</div>

				<div class="field sort-control m-0">
					<PanelButton icon="fas fa-arrow-down-short-wide" tooltip="Sort" width="200px">
						<p class="title is-5 m-0 p-0 pb-2">Sort settings</p>

						<Radios
							radios={DatasetSortingColumns}
							on:change={handleSortbyChanged}
							bind:value={sortby}
							groupName="sortby"
							isVertical={true}
						/>
					</PanelButton>
				</div>

				<div class="field pl-1">
					<div class="select">
						<select bind:value={limit} on:change={handleLimitChanged}>
							{#each LimitOptions as limit}
								<option value={`${limit}`}>{limit}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{#if selectedSDGs.length > 0}
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Filtered by SDG{selectedSDGs.length > 1 ? 's' : ''}</label>
		<div class="control">
			<div class="is-flex">
				{#key selectedSDGs}
					{#each selectedSDGs as tag}
						<div class="m-1">
							<SdgCard
								sdg={Number(tag.value)}
								isSelectable={false}
								showDelete={true}
								size="small"
								on:deleted={handleSDGDeleted}
							/>
						</div>
					{/each}
				{/key}
			</div>
		</div>
	</div>
{/if}

{#await datasets}
	<div class="align-center my-4">
		<Loader />
	</div>
{:then}
	{#if isLoading}
		<div class="align-center my-4">
			<Loader />
		</div>
	{:else if featureCollection.pages?.totalCount > 0}
		<div class="m-4">
			<Notification type="info" showCloseButton={true}>
				{featureCollection.pages?.totalCount} datasets found
			</Notification>
		</div>
		<PublishedDatasetHeader />
		{#each featureCollection.features as feature}
			<PublishedDatasetRow bind:feature on:deleted={handleDeleted} />
		{/each}

		<div class="align-center pt-5">
			<Pagination
				bind:totalPages={featureCollection.pages.totalPages}
				bind:currentPage={featureCollection.pages.currentPage}
				on:clicked={handlePaginationClicked}
			/>
		</div>
	{:else}
		<Notification type="info" showCloseButton={false}>No datasets found</Notification>
	{/if}
{/await}

<style lang="scss">
	.align-center {
		width: max-content;
		margin: auto;
	}

	.datasets-header {
		width: fit-content;
		margin-left: auto;

		.filter-text-box {
			position: relative;
			height: 35px;
			width: 200px;

			@media (max-width: 48em) {
				width: 150px;
			}

			.clear-button {
				position: absolute;
				top: 0.5rem;
				right: 1rem;
				cursor: pointer;
			}
		}
	}
</style>
