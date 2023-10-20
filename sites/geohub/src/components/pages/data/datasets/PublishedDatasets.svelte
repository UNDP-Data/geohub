<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import TagFilter from '$components/pages/data/datasets/TagFilter.svelte';
	import Notification from '$components/util/Notification.svelte';
	import PanelButton from '$components/util/PanelButton.svelte';
	import SdgCard from '$components/util/SdgCard.svelte';
	import SdgPicker from '$components/util/SdgPicker.svelte';
	import { DatasetSortingColumns, LimitOptions, SearchDebounceTime } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getBulmaTagColor } from '$lib/helper';
	import type { Country, DatasetFeature, DatasetFeatureCollection, Tag } from '$lib/types';
	import { Loader, Pagination, Radios, SearchExpand } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';
	import PublishedDatasetHeader from './PublishedDatasetHeader.svelte';
	import PublishedDatasetRow from './PublishedDatasetRow.svelte';
	const dispatch = createEventDispatcher();

	export let datasets: DatasetFeatureCollection;

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

	const getTagsFromUrl = (key: 'sdg_goal' | 'country') => {
		const values = $page.url.searchParams.getAll(key);
		const tags: Tag[] = [];
		values?.forEach((value) => {
			tags.push({
				key,
				value
			});
		});
		return tags;
	};

	const getContinentsFromUrl = () => {
		const key = 'continent';
		const continents = $page.url.searchParams.getAll(key) ?? [];
		return continents;
	};

	export let selectedSDGs: Tag[] = getTagsFromUrl('sdg_goal');
	export let selectedContinents: string[] = getContinentsFromUrl();
	export let selectedCountries: Tag[] = getTagsFromUrl('country');

	const getCountries = async () => {
		const res = await fetch(`/api/countries`);
		const json = await res.json();
		return json as Country[];
	};

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

	const handleFilterInput = async () => {
		if (!datasets) return;
		offset = '0';

		const link = datasets.links.find((l) => l.rel === 'self');
		if (!link) return;
		const href = new URL(link.href);
		href.searchParams.set('offset', offset);

		if (query.length > 0) {
			href.searchParams.set('query', query.trim());
			href.searchParams.set('queryoperator', queryType);
		} else {
			href.searchParams.delete('query');
		}
		await reload(href);
	};

	const handleLimitChanged = async () => {
		const currentLimit = $page.url.searchParams.get('limit')
			? $page.url.searchParams.get('limit')
			: `${config.DataPageSearchLimit}`;
		if (currentLimit && currentLimit !== limit) {
			offset = '0';

			const link = datasets.links.find((l) => l.rel === 'self');
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
		await reload($page.url);
	};

	const handleSortbyChanged = async () => {
		offset = '0';

		const link = datasets.links?.find((l) => l.rel === 'self');
		if (link) {
			const href = new URL(link.href);
			href.searchParams.set('sortby', sortby);
			href.searchParams.set('offset', offset);
			await reload(href);
		}
	};

	const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
		const type = e.detail.type;

		const link = datasets.links.find((l) => l.rel === type);
		if (link) {
			const href = new URL(link.href);
			await reload(href);
		}
	};

	const handleDeleted = async (e) => {
		const deletedFeature: DatasetFeature = e.detail.feature;
		const index = datasets.features.findIndex(
			(f) => f.properties.id === deletedFeature.properties.id
		);
		if (index > -1) {
			datasets.features.splice(index, 1);
			datasets.features = [...datasets.features];
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

	const handleContinentDeleted = async (name) => {
		const filtered = selectedContinents.filter((s) => s !== name);
		selectedContinents = [...filtered];

		const apiUrl = $page.url;
		apiUrl.searchParams.delete('continent');
		selectedContinents?.forEach((t) => {
			apiUrl.searchParams.append('continent', t);
		});

		await reload(apiUrl);
	};

	const handleCountrySelected = async (tag: Tag) => {
		const filtered = selectedCountries.filter((t) => t.value !== tag.value);
		selectedCountries = [...filtered];

		const apiUrl = $page.url;
		apiUrl.searchParams.delete('country');
		selectedCountries?.forEach((t) => {
			apiUrl.searchParams.append('country', t.value);
		});

		await reload(apiUrl);
	};
</script>

<div class="mb-6">
	<p class="title is-2 is-flex is-justify-content-center has-text-centered">
		Explore datasets by keywords
	</p>
	<div class="search-field">
		<SearchExpand
			bind:value={query}
			open={true}
			placeholder="Type keywords..."
			on:change={handleFilterInput}
			iconSize={30}
			fontSize={3}
			timeout={SearchDebounceTime}
			disabled={isLoading}
			loading={isLoading}
		/>
	</div>
</div>

<div class="datasets-header mb-5">
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

{#if selectedSDGs.length > 0 || selectedContinents.length > 0 || selectedCountries.length > 0}
	{@const count = selectedSDGs.length + selectedContinents.length + selectedCountries.length}
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Filtered by Tag{count > 1 ? 's' : ''}</label>
		<div class="control">
			<div class="tag-grid">
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
				{#key selectedContinents}
					{#each selectedContinents as continent}
						<span class="tag is-medium {getBulmaTagColor()} ml-2 mt-2">
							{continent}
							<button class="delete is-small" on:click={() => handleContinentDeleted(continent)}
							></button>
						</span>
					{/each}
				{/key}

				{#await getCountries() then countryMaster}
					{#key selectedCountries}
						{#each selectedCountries as country}
							{@const c = countryMaster.find((x) => x.iso_3 === country.value)}
							{#if c}
								<div
									class="country-tag is-vertical is-child is-flex is-flex-direction-column is-align-items-center ml-2"
								>
									<figure
										class={`country-flag image is-24x24 is-flex is-justify-content-center is-align-items-center`}
										data-testid="icon-figure"
									>
										{#if c.iso_2}
											<span class="fi fi-{c.iso_2.toLowerCase()}" />
										{:else}
											<i
												class="no-flag fa-solid fa-flag fa-2x"
												style="color: {chroma.random().css()}"
											/>
											<p>{c.country_name}</p>
										{/if}

										<button
											class="delete-button delete is-small"
											on:click={() => handleCountrySelected(country)}
										></button>
									</figure>
								</div>
							{/if}
						{/each}
					{/key}
				{/await}
			</div>
		</div>
	</div>
{/if}

{#if datasets}
	<div class="m-4">
		<Notification type="info" showCloseButton={true}>
			{#if datasets.pages?.totalCount > 0}
				{datasets.pages?.totalCount} datasets found
			{:else}
				No datasets found
			{/if}
		</Notification>
	</div>
{/if}
<PublishedDatasetHeader />

{#if !datasets || isLoading}
	<div class="align-center my-4">
		<Loader />
	</div>
{:else}
	{#each datasets.features as feature}
		<PublishedDatasetRow bind:feature on:deleted={handleDeleted} />
	{/each}

	<div class="align-center pt-5">
		<Pagination
			bind:totalPages={datasets.pages.totalPages}
			bind:currentPage={datasets.pages.currentPage}
			on:clicked={handlePaginationClicked}
		/>
	</div>
{/if}

<style lang="scss">
	.align-center {
		width: max-content;
		margin: auto;
	}

	.search-field {
		width: 50%;
		margin-left: auto;
		margin-right: auto;
		@media (max-width: 48em) {
			width: 100%;
		}
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

	.tag-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;

		.tag-delete {
			cursor: pointer;
		}

		.country-tag {
			.country-flag {
				width: fit-content;
				margin: auto;
			}

			.fi {
				width: 24px !important;
				line-height: 6em !important;
			}

			.no-flag {
				margin: 0 auto;
			}

			.delete-button {
				position: absolute;
				top: -5px;
				right: -7px;
			}
		}
	}
</style>
