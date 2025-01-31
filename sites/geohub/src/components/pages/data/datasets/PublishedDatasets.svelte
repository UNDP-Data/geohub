<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import {
		AccessLevel,
		DatasetSortingColumns,
		LimitOptions,
		SearchDebounceTime
	} from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { Country, DatasetFeatureCollection, TableViewType, Tag } from '$lib/types';
	import {
		CountrySelector,
		FieldControl,
		Notification,
		SdgSelector,
		SegmentButtons,
		ShowDetails,
		TagSelector
	} from '@undp-data/svelte-undp-components';
	import { Checkbox, Chips, Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import debounce from 'lodash-es/debounce';
	import { onMount } from 'svelte';
	import CardView from './CardView.svelte';
	import DatasetMapView from './DatasetMapView.svelte';
	import PublishedDatasetRow from './PublishedDatasetRow.svelte';

	interface Props {
		datasets: DatasetFeatureCollection | undefined;
		showMyData?: boolean;
		button?: import('svelte').Snippet;
	}

	let { datasets = $bindable(), showMyData = $bindable(false), button }: Props = $props();

	let isLoading = $state(false);

	const config: UserConfig = page.data.config;

	let viewType: TableViewType = $state(
		(page.url.searchParams.get('viewType') as TableViewType) ?? config.DataPageTableViewType
	);

	let limit = $state(page.url.searchParams.get('limit') ?? `${config.DataPageSearchLimit}`);
	let offset = page.url.searchParams.get('offset') ?? 0;
	let sortby = $state(page.url.searchParams.get('sortby') ?? config.DataPageSortingColumn);
	let query = $state(page.url.searchParams.get('query') ?? '');
	let queryType: 'and' | 'or' =
		(page.url.searchParams.get('queryoperator') as 'and' | 'or') ??
		config.DataPageSearchQueryOperator;
	let operatorType: 'and' | 'or' =
		(page.url.searchParams.get('operator') as 'and' | 'or') ??
		page.data.config.DataPageTagSearchOperator;
	let isOperatorTypeAnd = $state(operatorType === 'and');

	const _level = page.url.searchParams.get('accesslevel');
	let accessLevel: AccessLevel = $state(
		_level
			? (Number(_level) as AccessLevel)
			: page.data.session
				? AccessLevel.ALL
				: AccessLevel.PUBLIC
	);

	let showFavourite = $state(page.url.searchParams.get('staronly') === 'true' ? true : false);
	let showSatellite = $state(page.url.searchParams.get('type') === 'stac' ? true : false);
	let hideGlobal: boolean = $state(false);

	let searchedApiUrl: string = $state(page.url.href);
	let showAdvancedSearch = $state(false);

	const getTagsFromUrl = (key: 'sdg_goal' | 'country' | 'algorithm') => {
		const values = page.url.searchParams.getAll(key);
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
		const continents = page.url.searchParams.getAll(key) ?? [];
		return continents;
	};

	let selectedSDGs: Tag[] = getTagsFromUrl('sdg_goal');
	let selectedContinents: string[] = $state(getContinentsFromUrl());
	let selectedCountries: Tag[] = getTagsFromUrl('country');

	const reload = debounce(async (url: URL) => {
		if (!browser) return;
		try {
			isLoading = true;
			datasets = undefined;
			url.searchParams.delete('mydata');

			// reset default query params if it is not in queryparams
			const queryoperator = url.searchParams.get('queryoperator');
			if (!queryoperator) {
				url.searchParams.set('queryoperator', config.DataPageSearchQueryOperator);
			}
			const operator = url.searchParams.get('operator');
			if (!operator) {
				url.searchParams.set('operator', config.DataPageTagSearchOperator);
			}
			const sortby = url.searchParams.get('sortby');
			if (!sortby) {
				url.searchParams.set('sortby', config.DataPageSortingColumn);
			}
			const limit = url.searchParams.get('limit');
			if (!limit) {
				url.searchParams.set('limit', `${config.DataPageSearchLimit}`);
			}
			if (accessLevel !== AccessLevel.ALL) {
				url.searchParams.set('accesslevel', `${accessLevel}`);
			}

			if (showMyData) {
				url.searchParams.set('mydata', 'true');
			}
			await goto(`?${url.searchParams.toString()}`, {
				replaceState: true,
				invalidateAll: false,
				keepFocus: true,
				noScroll: true
			});

			searchedApiUrl = url.href;

			const res = await fetch(`/api/datasets${url.search}`);
			datasets = await res.json();
		} finally {
			isLoading = false;
		}
	}, 300);

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
		reload(href);
	};

	const handleLimitChanged = async () => {
		const currentLimit = page.url.searchParams.get('limit')
			? page.url.searchParams.get('limit')
			: `${config.DataPageSearchLimit}`;
		if (currentLimit && currentLimit !== limit) {
			offset = '0';

			const link = datasets?.links.find((l) => l.rel === 'self');
			if (link) {
				const href = new URL(link.href);
				href.searchParams.set('limit', limit);
				href.searchParams.set('offset', offset);
				reload(href);
			}
		}
	};

	const handleSortbyChanged = async () => {
		offset = '0';

		const link = datasets?.links?.find((l) => l.rel === 'self');
		if (link) {
			const href = new URL(link.href);
			href.searchParams.set('sortby', sortby);
			href.searchParams.set('offset', offset);
			reload(href);
		}
	};

	const handlePaginationClicked = async (type: 'previous' | 'next') => {
		const link = datasets?.links.find((l) => l.rel === type);
		if (link) {
			const href = new URL(link.href);
			reload(href);
		}
	};

	const handleAccessLevelChanged = async () => {
		offset = 0;

		const href = new URL(page.url);
		href.searchParams.set('offset', `${offset}`);
		if (accessLevel === AccessLevel.ALL) {
			href.searchParams.delete('accesslevel');
		} else {
			href.searchParams.set('accesslevel', `${accessLevel}`);
		}

		reload(href);
	};

	const handleFavouriteChanged = async () => {
		showFavourite = !showFavourite;

		const href = new URL(page.url);

		href.searchParams.delete('limit');
		href.searchParams.delete('offset');

		if (showFavourite) {
			href.searchParams.set('staronly', 'true');
		} else {
			href.searchParams.delete('staronly');
		}

		reload(href);
	};

	const handleSatelliteChanged = async () => {
		showSatellite = !showSatellite;

		const href = new URL(page.url);

		href.searchParams.delete('limit');
		href.searchParams.delete('offset');

		if (showSatellite) {
			href.searchParams.set('type', 'stac');
		} else {
			href.searchParams.delete('type');
		}

		reload(href);
	};

	const updateSDGtags = async () => {
		const apiUrl = page.url;
		apiUrl.searchParams.delete('sdg_goal');
		selectedSDGs?.forEach((t) => {
			apiUrl.searchParams.append(t.key, t.value as string);
		});

		reload(apiUrl);
	};

	const getSdgNumbers = () => {
		return selectedSDGs.map((s) => parseInt(s.value as string));
	};

	const handleSDGtagChanged = async (sdgs: number[]) => {
		selectedSDGs = [
			...sdgs.map((v: number) => {
				return {
					key: 'sdg_goal',
					value: v.toString()
				};
			})
		];
		selectedSDGs = [...selectedSDGs];
		await updateSDGtags();
	};

	const getCountryCodes = () => {
		return selectedCountries.map((c) => c.value as string);
	};

	const getTags = (key: string) => {
		let selectedTags: Tag[] = [];
		const values = page.url.searchParams.getAll(key);
		values.forEach((v) => {
			if (selectedTags.find((t) => t.key === key && t.value === v)) return;

			selectedTags.push({
				key: key,
				value: v
			});
		});
		return selectedTags;
	};

	const handleTagChanged = async (selected: Tag[], key: string) => {
		const apiUrl = page.url;
		apiUrl.searchParams.delete(key);
		selected?.forEach((t) => {
			apiUrl.searchParams.append(t.key, t.value as string);
		});
		reload(apiUrl);
	};

	const handleContinentDeleted = async (name: string) => {
		const filtered = selectedContinents.filter((s) => s !== name);
		selectedContinents = [...filtered];

		const apiUrl = page.url;
		apiUrl.searchParams.delete('continent');
		selectedContinents?.forEach((t) => {
			apiUrl.searchParams.append('continent', t);
		});

		reload(apiUrl);
	};

	const handleCountryChanged = async (countries: Country[]) => {
		selectedCountries = countries.map((c) => {
			return { key: 'country', value: c.iso_3 } as Tag;
		});

		const apiUrl = page.url;
		apiUrl.searchParams.delete('country');
		selectedCountries?.forEach((t) => {
			apiUrl.searchParams.append('country', t.value as string);
		});

		reload(apiUrl);
	};

	const handleViewTypeChanged = (value: string | number) => {
		viewType = value as TableViewType;

		const apiUrl = new URL(page.url);
		apiUrl.searchParams.set('viewType', viewType);
		replaceState(apiUrl, '');
	};

	const handleOperatorChanged = async () => {
		operatorType = isOperatorTypeAnd ? 'or' : 'and';
		const apiUrl = new URL(page.url);
		apiUrl.searchParams.delete('operator');
		apiUrl.searchParams.set('operator', operatorType);
		reload(apiUrl);
	};

	let isReseted = $state(false);
	const handleResetFilter = async () => {
		const apiUrl = new URL(`${page.url.origin}${page.url.pathname}${page.url.hash}`);
		limit = `${config.DataPageSearchLimit}`;
		offset = 0;
		sortby = config.DataPageSortingColumn;
		query = '';
		queryType = config.DataPageSearchQueryOperator;
		operatorType = page.data.config.DataPageTagSearchOperator;
		isOperatorTypeAnd = operatorType === 'and';
		showFavourite = false;
		showSatellite = false;
		accessLevel = AccessLevel.ALL;
		selectedContinents = [];
		apiUrl.searchParams.delete('continent');

		reload(apiUrl);
		isReseted = !isReseted;
	};

	onMount(() => {
		const apiUrl = new URL(page.url);
		reload(apiUrl);
	});
</script>

<section class="header-content columns is-flex is-flex-wrap-wrap">
	<div class="column is-12-mobile is-2 mt-auto p-0 pl-2">
		{@render button?.()}
	</div>
	<div
		class="column is-12-mobile is-flex is-align-items-center is-justify-content-flex-end is-flex-wrap-wrap p-0"
	>
		<div class="mr-2">
			<FieldControl title="Limits" showHelp={false}>
				{#snippet control()}
					<div>
						<div class="select mt-auto">
							<select bind:value={limit} onchange={handleLimitChanged} disabled={isLoading}>
								{#each LimitOptions as limit}
									<option value={`${limit}`}>{limit}</option>
								{/each}
							</select>
						</div>
					</div>
				{/snippet}
			</FieldControl>
		</div>
		<div class="mr-2">
			<FieldControl title="Sort results" showHelp={false}>
				{#snippet control()}
					<div>
						<div class="select mt-auto">
							<select bind:value={sortby} onchange={handleSortbyChanged} disabled={isLoading}>
								{#each DatasetSortingColumns as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
					</div>
				{/snippet}
			</FieldControl>
		</div>
		<div>
			<FieldControl title="View as" showHelp={false}>
				{#snippet control()}
					<div>
						<SegmentButtons
							buttons={[
								{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
								{ title: 'List', icon: 'fa-solid fa-list', value: 'list' },
								{ title: 'Map', icon: 'fa-solid fa-map', value: 'map' }
							]}
							bind:selected={viewType}
							onchange={handleViewTypeChanged}
						/>
					</div>
				{/snippet}
			</FieldControl>
		</div>
	</div>
</section>

<div class="columns pt-4">
	<div class="column is-3">
		<button
			class="button is-light has-text-weight-bold is-uppercase is-fullwidth"
			onclick={handleResetFilter}
		>
			reset filter
		</button>

		<div class="py-2">
			<SearchExpand
				bind:value={query}
				open={true}
				placeholder="Type keywords to explore datasets..."
				onchange={handleFilterInput}
				iconSize={20}
				fontSize={6}
				timeout={SearchDebounceTime}
				disabled={isLoading}
				loading={isLoading}
			/>
		</div>

		{#if page.data.session}
			<div class="py-2">
				<Checkbox
					label="Show starred only"
					bind:checked={showFavourite}
					onclick={handleFavouriteChanged}
					disabled={isLoading}
				/>
			</div>
		{/if}

		<div class="py-2">
			<Checkbox
				label="Show satellite data only"
				bind:checked={showSatellite}
				onclick={handleSatelliteChanged}
				disabled={isLoading}
			/>
		</div>

		{#if page.data.session}
			<div class="pt-2 pb-1">
				<FieldControl title="Access Level" showHelp={false}>
					{#snippet control()}
						<div>
							<AccessLevelSwitcher
								bind:accessLevel
								onchange={handleAccessLevelChanged}
								isSegmentButton={false}
								disabled={isLoading}
							/>
						</div>
					{/snippet}
				</FieldControl>
			</div>
		{/if}
		<div class="py-1">
			<FieldControl title="SDGs" isFirstCharCapitalized={false} showHelp={false}>
				{#snippet control()}
					<div>
						{#if browser}
							{#key isReseted}
								<SdgSelector
									selected={getSdgNumbers()}
									onselect={handleSDGtagChanged}
									isFullWidth={true}
								/>
							{/key}
						{/if}
					</div>
				{/snippet}
			</FieldControl>
		</div>

		<div class="py-1">
			<FieldControl title="Countries" isFirstCharCapitalized={false} showHelp={false}>
				{#snippet control()}
					<div>
						{#if browser}
							{#key isReseted}
								<CountrySelector selected={getCountryCodes()} onselect={handleCountryChanged} />
							{/key}
						{/if}
					</div>
				{/snippet}
			</FieldControl>
		</div>

		{#if selectedContinents.length > 0}
			{@const count = selectedContinents.length}
			<div class="py-1">
				<FieldControl
					title="Continent{count > 1 ? 's' : ''}"
					isFirstCharCapitalized={false}
					showHelp={false}
				>
					{#snippet control()}
						<div>
							<div class="flex is-flex-wrap-wrap pb-2">
								{#key selectedContinents}
									{#each selectedContinents as continent}
										<span class="pl-1">
											<Chips
												label={continent}
												showDelete={true}
												ondelete={() => {
													handleContinentDeleted(continent);
												}}
											/>
										</span>
									{/each}
								{/key}
							</div>
						</div>
					{/snippet}
				</FieldControl>
			</div>
		{/if}

		<div class="py-1">
			<ShowDetails
				bind:show={showAdvancedSearch}
				hideText="Show advanced search"
				showText="Hide advanced search"
			/>
		</div>
		<div hidden={!showAdvancedSearch}>
			{#each [{ key: 'provider', title: 'DataProviders' }, { key: 'year', title: 'Year' }, { key: 'resolution', title: 'Resolution' }, { key: 'theme', title: 'Theme' }, { key: 'granularity', title: 'Admin level' }] as tagKey}
				<div class="py-1">
					<FieldControl title={tagKey.title} isFirstCharCapitalized={false} showHelp={false}>
						{#snippet control()}
							<div>
								{#if browser}
									{#key isReseted}
										<TagSelector
											key={tagKey.key}
											selected={getTags(tagKey.key)}
											bind:apiUrl={searchedApiUrl}
											onselect={handleTagChanged}
											placeholder="Type {tagKey.title}..."
										/>
									{/key}
								{/if}
							</div>
						{/snippet}
					</FieldControl>
				</div>
			{/each}

			<div class="py-2">
				<Checkbox
					label="Match all conditions"
					bind:checked={isOperatorTypeAnd}
					onclick={handleOperatorChanged}
					disabled={isLoading}
				/>
			</div>
			<button
				class="button is-light has-text-weight-bold is-uppercase is-fullwidth"
				onclick={handleResetFilter}
			>
				reset filter
			</button>
		</div>
	</div>
	<div class="column">
		{#if isLoading}
			<div class="is-flex is-justify-content-center my-4">
				<Loader />
			</div>
		{:else if datasets && datasets?.pages?.totalCount > 0}
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
								<PublishedDatasetRow {feature} />
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			<div hidden={viewType !== 'card'}>
				<div class="columns is-multiline is-mobile">
					{#each datasets.features as feature}
						<div class="column is-one-third-tablet is-one-third-desktop is-full-mobile p-2">
							<CardView {feature} />
						</div>
					{/each}
				</div>
			</div>

			<div hidden={viewType !== 'map'}>
				<DatasetMapView bind:datasets bind:hideGlobal />
			</div>

			<div class="pt-5">
				<Pagination
					bind:totalPages={datasets.pages.totalPages}
					bind:currentPage={datasets.pages.currentPage}
					hidden={datasets.pages.totalPages <= 1}
					onclick={handlePaginationClicked}
				/>
			</div>
		{:else}
			<div class="m-2">
				<Notification type="info" showCloseButton={false}>No datasets found</Notification>
			</div>
		{/if}
	</div>
</div>
