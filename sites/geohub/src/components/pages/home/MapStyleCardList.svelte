<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import Star from '$components/util/Star.svelte';
	import {
		AccessLevel,
		LimitOptions,
		MapSortingColumns,
		SearchDebounceTime
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { MapsData, TableViewType } from '$lib/types';
	import {
		Notification,
		SegmentButtons,
		initTooltipTippy
	} from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	const dispatch = createEventDispatcher();

	export let mapData: MapsData;
	export let showMenu = true;

	let tippyTooltip = initTooltipTippy();

	const _limit = $page.url.searchParams.get('limit');
	let limit = _limit ? Number(_limit) : $page.data.config.MapPageSearchLimit;
	let offset = Number($page.url.searchParams.get('offset'));

	let query = $page.url.searchParams.get('query') ?? '';

	const _level = $page.url.searchParams.get('accesslevel');
	let accessLevel: AccessLevel = _level
		? (Number(_level) as AccessLevel)
		: $page.data.session
			? AccessLevel.PRIVATE
			: AccessLevel.PUBLIC;

	const _onlyStar = $page.url.searchParams.get('staronly') || 'false';
	let onlyStar = _onlyStar.toLowerCase() === 'true';

	let viewType: TableViewType = $page.data.viewType;

	const normaliseQuery = () => {
		if (query.length > 0) {
			return query.trim().replace(/\s/g, ` and `);
		} else {
			return query;
		}
	};

	const getSortByFromUrl = (url: URL) => {
		const sortByValue = url.searchParams.get('sortby');
		if (sortByValue) {
			const option = MapSortingColumns.find((opt) => opt.value === sortByValue);
			if (option) {
				return option.value;
			}
		}
	};

	let sortby = getSortByFromUrl($page.url) ?? $page.data.config.MapPageSortingColumn;

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

	const handleSortbyChanged = async () => {
		offset = 0;

		const apiUrl = new URL($page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		apiUrl.searchParams.set('sortby', sortby);

		await reload(apiUrl);
	};

	const handleAccessLevelChanged = async () => {
		offset = 0;

		const apiUrl = new URL($page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		apiUrl.searchParams.set('accesslevel', `${accessLevel}`);

		await reload(apiUrl);
	};

	const reload = async (url: URL) => {
		mapData = undefined;

		if (browser) {
			const anchor = document.getElementById('style-list-top');
			window.scrollTo({
				top: anchor.offsetTop - 100,
				behavior: 'instant'
			});
		}

		await goto(`?${url.searchParams.toString()}`, {
			invalidateAll: false,
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});
		dispatch('change');
	};

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		await reload(apiUrl);
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

	const handleViewTypeChanged = (e) => {
		viewType = e.detail.value;

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('viewType', viewType);
		replaceState(apiUrl, '');
	};
</script>

<section id="style-list-top">
	{#if showMenu}
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
					disabled={!mapData}
					loading={!mapData}
				/>
			</div>
		</div>

		<div class="is-flex is-justify-content-flex-end mb-2">
			{#if $page.data.session}
				<div class="control">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Search maps shared to:</label>
						<AccessLevelSwitcher bind:accessLevel on:change={handleAccessLevelChanged} />
					</div>
				</div>
			{/if}
		</div>

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
						{#each MapSortingColumns as option}
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
	{/if}
</section>

{#if !mapData}
	<div class="is-flex is-justify-content-center">
		<Loader size="medium" />
	</div>
{:else if mapData.styles?.length > 0}
	{#key mapData.styles}
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
						{#each mapData.styles as style}
							{@const mapLink = style.links.find((l) => l.rel === 'map')?.href}
							{@const accessIcon = getAccessLevelIcon(style.access_level, true)}

							<tr class="map-row">
								<td
									class="map-title map-col"
									on:click={() => {
										goto(mapLink);
									}}
								>
									{style.name}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(mapLink);
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
										goto(mapLink);
									}}
								>
									<Time timestamp={style.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(mapLink);
									}}>{style.created_user}</td
								>
								<td
									class="map-col"
									on:click={() => {
										goto(mapLink);
									}}
								>
									{#if style.updated_user}
										<Time timestamp={style.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(mapLink);
									}}
								>
									{#if style.updated_user}
										{style.updated_user}
									{/if}
								</td>
								<td>
									<Star
										isCompact={true}
										bind:id={style.id}
										bind:isStar={style.is_star}
										bind:no_stars={style.no_stars}
										table="style"
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="columns is-multiline is-mobile">
				{#each mapData.styles as style}
					{@const mapLink = style.links.find((l) => l.rel === 'map')?.href}
					{@const styleLink = style.links.find((l) => l.rel === 'static-auto')?.href}
					{@const accessLevel = style.access_level}
					{@const accessIcon = getAccessLevelIcon(accessLevel, true)}

					<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
						<CardWithImage
							title={style.name}
							url={mapLink}
							tag="Map"
							image={styleLink.replace('{width}', '298').replace('{height}', '180')}
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
		{/if}
	{/key}

	{#if showMenu}
		<div class="is-flex is-justify-content-center pt-2">
			<Pagination
				totalPages={mapData.pages.totalPages}
				currentPage={mapData.pages.currentPage}
				on:clicked={(e) => {
					const url = mapData.links?.find((l) => l.rel === e.detail.type)?.href;
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

<style lang="scss">
	.search-field {
		width: 50%;
		margin-left: auto;
		margin-right: auto;
		@media (max-width: 48em) {
			width: 100%;
		}
	}

	.styles-header {
		width: fit-content;
		margin-left: auto;
	}

	:global(.accordion-header) {
		padding-left: 1.5rem !important;
	}

	.star-button {
		height: 40px;
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
