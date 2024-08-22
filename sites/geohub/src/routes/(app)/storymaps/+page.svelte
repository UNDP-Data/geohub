<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import Star from '$components/util/Star.svelte';
	import {
		AccessLevel,
		LimitOptions,
		SearchDebounceTime,
		StorymapSortingColumns
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { StorymapsData, TableViewType } from '$lib/types';
	import {
		HeroHeader,
		initTooltipTippy,
		Notification,
		SegmentButtons,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import Time from 'svelte-time/Time.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let tippyTooltip = initTooltipTippy();

	let storiesData: StorymapsData = data.stories;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'storymaps', url: $page.url.href }
	];

	let query = $page.url.searchParams.get('query') ?? '';

	const _limit = $page.url.searchParams.get('limit');
	let limit = _limit ? Number(_limit) : $page.data.config.StorymapPageSearchLimit;
	let offset = Number($page.url.searchParams.get('offset'));

	const _level = $page.url.searchParams.get('accesslevel');
	let accessLevel: AccessLevel = _level
		? (Number(_level) as AccessLevel)
		: $page.data.session
			? AccessLevel.PRIVATE
			: AccessLevel.PUBLIC;

	const _onlyStar = $page.url.searchParams.get('staronly') || 'false';
	let onlyStar = _onlyStar.toLowerCase() === 'true';

	let viewType: TableViewType =
		($page.url.searchParams.get('viewType') as TableViewType) ||
		$page.data.config.StorymapPageTableViewType;

	const getSortByFromUrl = (url: URL) => {
		const sortByValue = url.searchParams.get('sortby');
		if (sortByValue) {
			const option = StorymapSortingColumns.find((opt) => opt.value === sortByValue);
			if (option) {
				return option.value;
			}
		}
	};

	let sortby = getSortByFromUrl($page.url) ?? $page.data.config.MapPageSortingColumn;

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		await reload(apiUrl);
	};

	const handleAccessLevelChanged = async () => {
		offset = 0;

		const apiUrl = new URL($page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		apiUrl.searchParams.set('accesslevel', `${accessLevel}`);

		await reload(apiUrl);
	};

	const handleClickFavourite = async () => {
		onlyStar = !onlyStar;

		const apiUrl = new URL($page.url.toString());
		offset = 0;
		apiUrl.searchParams.set('offset', `${offset}`);

		if (onlyStar) {
			apiUrl.searchParams.set('staronly', `${onlyStar}`);
		} else {
			query = '';
			apiUrl.searchParams.delete('staronly');
		}
		await reload(apiUrl);
	};

	const handleSortbyChanged = async () => {
		offset = 0;

		const apiUrl = new URL($page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		apiUrl.searchParams.set('sortby', sortby);

		await reload(apiUrl);
	};

	const handleLimitChanged = async () => {
		const apiUrl = new URL($page.url.toString());
		const currentLimit = apiUrl.searchParams.get('limit')
			? Number(apiUrl.searchParams.get('limit'))
			: undefined;
		if (currentLimit && currentLimit !== limit) {
			offset = 0;
			apiUrl.searchParams.set('offset', `${offset}`);
		}
		apiUrl.searchParams.set('limit', `${limit}`);

		await reload(apiUrl);
	};

	const normaliseQuery = () => {
		if (query.length > 0) {
			return query.trim().replace(/\s/g, ` and `);
		} else {
			return query;
		}
	};

	const handleFilterInput = async () => {
		const apiUrl = new URL($page.url.toString());
		offset = 0;
		apiUrl.searchParams.set('offset', `${offset}`);

		if (query.length > 0) {
			let queryForSearch = query;
			queryForSearch = normaliseQuery();
			if (queryForSearch && queryForSearch.length > 0) {
				apiUrl.searchParams.set('query', queryForSearch);
			} else {
				return;
			}
		} else {
			query = '';
			apiUrl.searchParams.delete('query');
		}
		await reload(apiUrl);
	};

	const reload = async (url: URL) => {
		storiesData = undefined;

		if (browser) {
			const anchor = document.getElementById('storymap-list-top');
			window.scrollTo({
				top: anchor.offsetTop - 100,
				behavior: 'instant'
			});
		}

		await goto(`?${url.searchParams.toString()}`, {
			invalidateAll: true,
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});

		storiesData = data.stories;
	};

	const handleViewTypeChanged = (e) => {
		viewType = e.detail.value;

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('viewType', viewType);
		replaceState(apiUrl, '');
	};
</script>

<HeroHeader
	title="Storymap builder"
	bind:breadcrumbs
	button={{ title: 'create new', href: '/storymaps/edit', tooltip: 'Create a new storymap' }}
/>

<div class="mx-6 my-4">
	<section id="storymap-list-top">
		<div class="mb-6">
			<div class="search-field">
				<SearchExpand
					bind:value={query}
					open={true}
					placeholder="Type keywords..."
					on:change={handleFilterInput}
					iconSize={20}
					fontSize={6}
					timeout={SearchDebounceTime}
					disabled={!storiesData}
					loading={!storiesData}
				/>
			</div>
		</div>

		{#if $page.data.session}
			<div class="is-flex is-justify-content-flex-end mb-2">
				<div class="control">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Search storymaps shared to:</label>
						<AccessLevelSwitcher bind:accessLevel on:change={handleAccessLevelChanged} />
					</div>
				</div>
			</div>
		{/if}

		<div class="is-flex is-justify-content-flex-end mb-2">
			{#if $page.data.session}
				<div class="control pr-1 mt-auto">
					<button
						class="star-button button {onlyStar ? 'is-link' : ''} mt-auto"
						on:click={handleClickFavourite}
						use:tippyTooltip={{ content: 'Show only my favourite datasets' }}
					>
						<span class="icon is-small">
							<i class="fas fa-star"></i>
						</span>
					</button>
				</div>
			{/if}
			<div class="control">
				<div class="select mt-auto">
					<select bind:value={sortby} on:change={handleSortbyChanged}>
						{#each StorymapSortingColumns as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<div class="is-flex is-justify-content-flex-end mb-2">
			<div class="control pr-1">
				<div class="select mt-auto">
					<select bind:value={limit} on:change={handleLimitChanged}>
						{#each LimitOptions as limit}
							<option value={limit}>{limit}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="control">
				<SegmentButtons
					buttons={[
						{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
						{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }
					]}
					bind:selected={viewType}
					on:change={handleViewTypeChanged}
				/>
			</div>
		</div>
	</section>

	{#if !storiesData}
		<div class="is-flex is-justify-content-center">
			<Loader size="medium" />
		</div>
	{:else if storiesData.stories?.length > 0}
		{#if viewType === 'list'}
			<div class="table-container">
				<table class="map-table table is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th class="map-title">Title</th>
							<th></th>
							<th>Created at</th>
							<th>Created by</th>
							<th>Updated at</th>
							<th>Updated by</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each storiesData.stories as story}
							{@const storymapLink = story.links.find((l) => l.rel === 'storymap')?.href}
							{@const accessIcon = getAccessLevelIcon(story.access_level, true)}

							<tr class="map-row">
								<td
									class="map-title map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{story.title}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{#if accessIcon}
										<span class="icon">
											<i class={accessIcon} />
										</span>
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									<Time timestamp={story.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}>{story.created_user}</td
								>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{#if story.updated_user}
										<Time timestamp={story.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{#if story.updated_user}
										{story.updated_user}
									{/if}
								</td>
								<td>
									<Star
										isCompact={true}
										bind:id={story.id}
										bind:isStar={story.is_star}
										bind:no_stars={story.no_stars}
										table="storymaps"
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="columns is-multiline is-mobile">
				{#each storiesData.stories as story}
					{@const storyLink = story.links.find((l) => l.rel === 'storymap')?.href}
					{@const staticLink = story.links.find((l) => l.rel === 'static-auto')?.href}
					{@const accessLevel = story.access_level}
					{@const accessIcon = getAccessLevelIcon(accessLevel, true)}

					<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
						<CardWithImage
							title={story.title}
							url={storyLink}
							tag="Story"
							image={staticLink.replace('{width}', '298').replace('{height}', '180')}
							width={298}
							height={180}
							linkName="Explore"
							accent={accessLevel === AccessLevel.PRIVATE
								? 'red'
								: accessLevel === AccessLevel.ORGANIZATION
									? 'blue'
									: 'yellow'}
							icon={accessIcon}
						/>
					</div>
				{/each}
			</div>

			<div class="is-flex is-justify-content-center pt-2">
				<Pagination
					totalPages={storiesData.pages.totalPages}
					currentPage={storiesData.pages.currentPage}
					hidden={storiesData.pages.totalPages <= 1}
					on:clicked={(e) => {
						const url = storiesData.links?.find((l) => l.rel === e.detail.type)?.href;
						if (!url) return;
						handlePaginationClicked(url);
					}}
				/>
			</div>
		{/if}
	{:else}
		<div class="p-4">
			<Notification type="info" showCloseButton={false}>No map found</Notification>
		</div>
	{/if}
</div>

<style lang="scss">
	.search-field {
		width: 50%;
		margin-left: auto;
		margin-right: auto;
		@media (max-width: 48em) {
			width: 100%;
		}
	}

	.star-button {
		border: 1px solid #000;
	}

	.map-table {
		.map-title {
			min-width: 250px;
		}
		.map-col {
			cursor: pointer;

			&:hover {
				color: #006eb5;
			}
		}
	}
</style>
