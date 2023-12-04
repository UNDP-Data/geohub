<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import TagFilter from '$components/pages/data/datasets/TagFilter.svelte';
	import CountryPicker from '$components/util/CountryPicker.svelte';
	import Notification from '$components/util/Notification.svelte';
	import PanelButton from '$components/util/PanelButton.svelte';
	import SdgCard from '$components/util/SdgCard.svelte';
	import SdgPicker from '$components/util/SdgPicker.svelte';
	import { DatasetSortingColumns, LimitOptions, SearchDebounceTime } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getBulmaTagColor } from '$lib/helper';
	import type { Country, DatasetFeatureCollection, TableViewType, Tag } from '$lib/types';
	import { Loader, Pagination, Radios, SearchExpand } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';
	import CardView from './CardView.svelte';
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

	let viewType: TableViewType =
		($page.url.searchParams.get('viewType') as TableViewType) ?? config.DataPageTableViewType;

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
	let showSatellite = $page.url.searchParams.get('type') === 'stac' ? true : false;

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

	let selectedSDGs: Tag[] = getTagsFromUrl('sdg_goal');
	let selectedContinents: string[] = getContinentsFromUrl();
	let selectedCountries: Tag[] = getTagsFromUrl('country');

	const getCountries = async () => {
		const res = await fetch(`/api/countries`);
		const json = await res.json();
		return json as Country[];
	};

	const reload = async (url: URL) => {
		try {
			isLoading = true;
			datasets = undefined;
			await goto(`?${url.searchParams.toString()}`, {
				invalidateAll: false,
				noScroll: true
			});
			await invalidate('data:datasets');
			datasets = $page.data.datasets;
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

	const handleSatelliteChanged = async () => {
		showSatellite = !showSatellite;

		const href = new URL($page.url);

		href.searchParams.delete('limit');
		href.searchParams.delete('offset');

		if (showSatellite) {
			href.searchParams.set('type', 'stac');
		} else {
			href.searchParams.delete('type');
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

	const handleCountryChanged = async (e) => {
		const countries: Country[] = e.detail.countries;
		selectedCountries = countries.map((c) => {
			return { key: 'country', value: c.iso_3 } as Tag;
		});

		const apiUrl = $page.url;
		apiUrl.searchParams.delete('country');
		selectedCountries?.forEach((t) => {
			apiUrl.searchParams.append('country', t.value);
		});

		await reload(apiUrl);
	};

	const handleCountryDeleted = async (tag: Tag) => {
		const filtered = selectedCountries.filter((t) => t.value !== tag.value);
		selectedCountries = [...filtered];

		const apiUrl = $page.url;
		apiUrl.searchParams.delete('country');
		selectedCountries?.forEach((t) => {
			apiUrl.searchParams.append('country', t.value);
		});

		await reload(apiUrl);
	};

	const handleViewTypeChanged = (type: TableViewType) => {
		viewType = type;

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('viewType', type);
		history.replaceState({}, null, apiUrl.href);
	};
</script>

<div class="mb-6">
	<div class="search-field">
		<SearchExpand
			bind:value={query}
			open={true}
			placeholder="Type keywords to explore datasets..."
			on:change={handleFilterInput}
			iconSize={24}
			fontSize={4}
			timeout={SearchDebounceTime}
			disabled={isLoading}
			loading={isLoading}
		/>
	</div>
</div>

<div class="is-flex is-justify-content-flex-end field has-addons">
	{#if $page.data.session}
		<p class="control">
			<button
				class="button {showMyData ? 'is-primary' : ''} has-tooltip-arrow has-tooltip-top"
				on:click={handleMyDataChanged}
				disabled={isLoading}
				data-tooltip="Show only my datasets"
			>
				<span class="icon is-small">
					<i class="fas fa-user"></i>
				</span>
			</button>
		</p>
		<p class="control">
			<button
				class="button {showFavourite ? 'is-primary' : ''} has-tooltip-arrow has-tooltip-top"
				on:click={handleFavouriteChanged}
				disabled={isLoading}
				data-tooltip="Show only my favourite datasets"
			>
				<span class="icon is-small">
					<i class="fas fa-star"></i>
				</span>
			</button>
		</p>
		<p class="control">
			<button
				class="button {showSatellite ? 'is-primary' : ''} has-tooltip-arrow has-tooltip-top"
				on:click={handleSatelliteChanged}
				disabled={isLoading}
				data-tooltip="Show only satallite datasets"
			>
				<span class="icon is-small">
					<i class="fas fa-satellite"></i>
				</span>
			</button>
		</p>
	{/if}

	<div class="control pl-1">
		<SdgPicker bind:tags={selectedSDGs} on:change={handleSDGtagChanged} disabled={isLoading} />
	</div>
	<div class="control pl-1">
		<CountryPicker
			on:change={handleCountryChanged}
			bind:tags={selectedCountries}
			buttonIcon="fa-solid fa-flag fa-xl"
			showSelectedCountries={false}
			showOnlyExists={true}
			disabled={isLoading}
		/>
	</div>

	<div class="control">
		<PanelButton
			icon="fas fa-sliders"
			tooltip="Explore tags and filter data"
			bind:isShow={isTagFilterShow}
			width="300px"
			disabled={isLoading}
		>
			<p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
			<p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
			<TagFilter bind:isShow={isTagFilterShow} on:change={handleTagChanged} />
		</PanelButton>
	</div>
</div>

<div class="is-flex is-justify-content-flex-end field has-addons mb-5">
	<div class="control pr-1">
		<PanelButton
			icon="fas fa-arrow-down-short-wide"
			tooltip="Sort"
			width="200px"
			disabled={isLoading}
		>
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
	<div class="control pr-1">
		<div class="select">
			<select bind:value={limit} on:change={handleLimitChanged} disabled={isLoading}>
				{#each LimitOptions as limit}
					<option value={`${limit}`}>{limit}</option>
				{/each}
			</select>
		</div>
	</div>
	<p class="control">
		<button
			class="button {viewType === 'card' ? 'is-link' : ''}"
			on:click={() => handleViewTypeChanged('card')}
		>
			<span class="icon is-small">
				<i class="fa-solid fa-border-all fa-lg"></i>
			</span>
			<span>Card view</span>
		</button>
	</p>
	<p class="control">
		<button
			class="button {viewType === 'list' ? 'is-link' : ''}"
			on:click={() => handleViewTypeChanged('list')}
		>
			<span class="icon is-small">
				<i class="fa-solid fa-list"></i>
			</span>
			<span>List view</span>
		</button>
	</p>
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
											on:click={() => handleCountryDeleted(country)}
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

{#if isLoading}
	<div class="align-center my-4">
		<Loader />
	</div>
{:else if datasets?.pages?.totalCount > 0}
	<div hidden={viewType !== 'list'}>
		<div class="table-container">
			<table class="table is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Dataset name</th>
						<th>Description</th>
						<th>SDG</th>
						<th>License</th>
						<th>Updated at</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each datasets.features as feature}
						<PublishedDatasetRow bind:feature />
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div hidden={viewType !== 'card'}>
		<div class="columns is-multiline is-mobile">
			{#each datasets.features as feature}
				<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile p-2">
					<CardView {feature} />
				</div>
			{/each}
		</div>
	</div>

	<div class="align-center pt-5">
		<Pagination
			bind:totalPages={datasets.pages.totalPages}
			bind:currentPage={datasets.pages.currentPage}
			on:clicked={handlePaginationClicked}
		/>
	</div>
{:else}
	<div class="m-2">
		<Notification type="info" showCloseButton={false}>No datasets found</Notification>
	</div>
{/if}

<style lang="scss">
	.align-center {
		width: max-content;
		margin: auto;
	}

	.search-field {
		width: 80%;
		margin-left: auto;
		margin-right: auto;
		@media (max-width: 48em) {
			width: 100%;
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
