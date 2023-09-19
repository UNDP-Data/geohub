<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/AccessLevelSwitcher.svelte';
	import Notification from '$components/controls/Notification.svelte';
	import {
		AccessLevel,
		LimitOptions,
		MapSortingColumns,
		SearchDebounceTime
	} from '$lib/config/AppConfig';
	import type { MapsData, StacLink } from '$lib/types';
	import { Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import MapStyleCard from './MapStyleCard.svelte';
	const dispatch = createEventDispatcher();

	export let promise: Promise<MapsData>;

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
		promise = undefined;
		const anchor = document.getElementById('style-list-top');
		window.scrollTo({
			top: anchor.offsetTop - 100,
			behavior: 'instant'
		});

		await goto(`?${url.searchParams.toString()}`, {
			invalidateAll: false,
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});
		dispatch('change');
	};

	const handlePaginationClicked = async (link: StacLink) => {
		const apiUrl = new URL(link.href);
		await reload(apiUrl);
	};

	const handleStyleDeleted = async () => {
		promise = undefined;
		dispatch('change');
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
</script>

<section id="style-list-top" class="hero">
	<div class="hero-body">
		<p class="title is-2 is-flex is-justify-content-center has-text-centered">
			Explore maps by keywords
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
			/>
		</div>
	</div>
</section>

<div class="styles-header tile is-ancestor">
	{#if $page.data.session}
		<div class="tile is-parent">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Search maps shared to:</label>
				<AccessLevelSwitcher bind:accessLevel on:change={handleAccessLevelChanged} />
			</div>
		</div>
	{/if}

	<div class="tile is-parent">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Order by:</label>
			<div class="select">
				<select bind:value={sortby} on:change={handleSortbyChanged}>
					{#each MapSortingColumns as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<div class="tile is-parent">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Shown in:</label>
			<div class="select">
				<select bind:value={limit} on:change={handleLimitChanged}>
					{#each LimitOptions as limit}
						<option value={limit}>{limit}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>

{#if !promise}
	<div class="align-center">
		<Loader size="medium" />
	</div>
{:else}
	{#await promise}
		<div class="align-center">
			<Loader size="medium" />
		</div>
	{:then styles}
		{#if styles.styles?.length > 0}
			{#key styles.styles}
				<div class="grid">
					{#each styles.styles as style}
						<MapStyleCard {style} on:deleted={handleStyleDeleted} />
					{/each}
				</div>
			{/key}

			<div class="align-center pt-2">
				<Pagination
					totalPages={styles.pages.totalPages}
					currentPage={styles.pages.currentPage}
					on:clicked={(e) => {
						const link = styles.links?.find((l) => l.rel === e.detail.type);
						if (!link) return;
						handlePaginationClicked(link);
					}}
				/>
			</div>
		{:else}
			<div class="p-4">
				<Notification type="info" showCloseButton={false}>No map found</Notification>
			</div>
		{/if}
	{/await}
{/if}

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr); /* デスクトップ：3列 */
		gap: 20px;

		@media (max-width: 63.9375em) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (max-width: 48em) {
			grid-template-columns: 1fr;
		}
	}

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

	.styles-header {
		width: fit-content;
		margin-left: auto;
	}

	:global(.accordion-header) {
		padding-left: 1.5rem !important;
	}
</style>
