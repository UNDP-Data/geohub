<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import MapStyleCardList from '$components/pages/home/MapStyleCardList.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import {
		AccessLevel,
		LimitOptions,
		MapSortingColumns,
		SearchDebounceTime
	} from '$lib/config/AppConfig';
	import type { MapsData, TableViewType } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLayerListStore,
		createMapStore,
		type LayerListStore
	} from '$stores';
	import {
		FieldControl,
		HeroHeader,
		SegmentButtons,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { Checkbox, SearchExpand } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let mapsData: MapsData = data.styles;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'maps', url: $page.url.href }
	];

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	let layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

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

	let viewType: TableViewType = $page.data.viewType;

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

	const handleViewTypeChanged = (e) => {
		viewType = e.detail.value;

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('viewType', viewType);
		replaceState(apiUrl, '');
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

	const reload = async (url: URL) => {
		mapsData = undefined;

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

		mapsData = data.styles;
	};

	const handlePaginationClicked = async (e) => {
		const apiUrl = e.detail.url;
		await reload(apiUrl);
	};

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<HeroHeader title="Explore maps" bind:breadcrumbs />

<div class="m-6 my-4">
	<section id="style-list-top" class="header-content columns is-flex is-flex-wrap-wrap">
		<div class="column is-12-mobile is-2 mt-auto p-0">
			<a class="button is-primary is-uppercase has-text-weight-bold" href="/maps/edit">
				create map
			</a>
		</div>

		<div
			class="column is-12-mobile is-flex is-align-items-center is-justify-content-flex-end is-flex-wrap-wrap p-0"
		>
			<div class="mr-2">
				<FieldControl title="Limits" showHelp={false}>
					<div slot="control">
						<div class="select mt-auto">
							<select bind:value={limit} on:change={handleLimitChanged}>
								{#each LimitOptions as limit}
									<option value={limit}>{limit}</option>
								{/each}
							</select>
						</div>
					</div>
				</FieldControl>
			</div>
			<div class="mr-2">
				<FieldControl title="Sort results" showHelp={false}>
					<div slot="control">
						<div class="select mt-auto">
							<select bind:value={sortby} on:change={handleSortbyChanged}>
								{#each MapSortingColumns as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</FieldControl>
			</div>
			<div>
				<FieldControl title="View as" showHelp={false}>
					<div slot="control">
						<SegmentButtons
							buttons={[
								{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
								{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }
							]}
							bind:selected={viewType}
							on:change={handleViewTypeChanged}
						/>
					</div>
				</FieldControl>
			</div>
		</div>
	</section>

	<div class="columns pt-4">
		<div class="column is-3">
			<SearchExpand
				bind:value={query}
				open={true}
				placeholder="Type keywords..."
				on:change={handleFilterInput}
				iconSize={20}
				fontSize={6}
				timeout={SearchDebounceTime}
				disabled={!mapsData}
				loading={!mapsData}
			/>

			{#if $page.data.session}
				<div class="py-2">
					<FieldControl title="Access Level" showHelp={false}>
						<div slot="control">
							<AccessLevelSwitcher
								bind:accessLevel
								on:change={handleAccessLevelChanged}
								isSegmentButton={false}
							/>
						</div>
					</FieldControl>
				</div>

				<div class="py-2">
					<Checkbox
						label="Show starred only"
						bind:checked={onlyStar}
						on:clicked={handleClickFavourite}
					/>
				</div>
			{/if}
		</div>
		<div class="column">
			<MapStyleCardList bind:mapData={mapsData} on:reload={handlePaginationClicked} bind:viewType />
		</div>
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.header-content {
		margin: 48px 0;
	}
</style>
