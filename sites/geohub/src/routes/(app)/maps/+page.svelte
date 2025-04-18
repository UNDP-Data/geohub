<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import MapStyleCardList from '$components/pages/map/MapStyleCardList.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import {
		AccessLevel,
		LimitOptions,
		MapSortingColumns,
		SearchDebounceTime
	} from '$lib/config/AppConfig';
	import type { MapsData, TableViewType } from '$lib/types';
	import { LAYERLISTSTORE_CONTEXT_KEY, createLayerListStore, type LayerListStore } from '$stores';
	import {
		FieldControl,
		HeroHeader,
		MAPSTORE_CONTEXT_KEY,
		SegmentButtons,
		createMapStore,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { Checkbox, SearchExpand } from '@undp-data/svelte-undp-design';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let mapData: MapsData | undefined = $state(data.styles);

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'maps', url: page.url.href }
	]);

	enum TabNames {
		MAPS = 'Maps',
		MY_MAP = 'My maps'
	}

	let tabs: Tab[] = $state([]);
	let activeTab: string = $state('');
	const hash = page.url.hash;

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	let layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	const _limit = page.url.searchParams.get('limit');
	let limit = $state(_limit ? Number(_limit) : page.data.config.MapPageSearchLimit);
	let offset = Number(page.url.searchParams.get('offset'));
	let query = $state(page.url.searchParams.get('query') ?? '');

	const _level = page.url.searchParams.get('accesslevel');
	let accessLevel: AccessLevel = $state(
		_level
			? (Number(_level) as AccessLevel)
			: page.data.session
				? AccessLevel.ALL
				: AccessLevel.PUBLIC
	);

	const _onlyStar = page.url.searchParams.get('staronly') || 'false';
	let onlyStar = $state(_onlyStar.toLowerCase() === 'true');

	const getSortByFromUrl = (url: URL) => {
		const sortByValue = url.searchParams.get('sortby');
		if (sortByValue) {
			const option = MapSortingColumns.find((opt) => opt.value === sortByValue);
			if (option) {
				return option.value;
			}
		}
	};

	let sortby = $state(getSortByFromUrl(page.url) ?? page.data.config.MapPageSortingColumn);

	let viewType: TableViewType = $state(page.data.viewType);

	const handleLimitChanged = async () => {
		const apiUrl = new URL(page.url.toString());
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

		const apiUrl = new URL(page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		apiUrl.searchParams.set('sortby', sortby);

		await reload(apiUrl);
	};

	const handleViewTypeChanged = (value: string | number) => {
		viewType = value as TableViewType;

		const apiUrl = new URL(page.url);
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
		const apiUrl = new URL(page.url.toString());
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

		const apiUrl = new URL(page.url.toString());
		apiUrl.searchParams.set('offset', `${offset}`);
		if (accessLevel === AccessLevel.ALL) {
			apiUrl.searchParams.delete('accesslevel');
		} else {
			apiUrl.searchParams.set('accesslevel', `${accessLevel}`);
		}

		await reload(apiUrl);
	};

	const handleClickFavourite = async () => {
		onlyStar = !onlyStar;

		const apiUrl = new URL(page.url.toString());
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
		mapData = undefined;

		if (browser) {
			const anchor = document.getElementById('style-list-top');
			if (anchor) {
				window.scrollTo({
					top: anchor.offsetTop - 200,
					behavior: 'instant'
				});
			}
		}

		await goto(`?${url.searchParams.toString()}`, {
			invalidateAll: false,
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});

		mapData = data.styles;
	};

	const handlePaginationClicked = async (apiUrl: URL) => {
		await reload(apiUrl);
	};

	const loadActiveTab = async () => {
		if (tabs.length > 0) {
			activeTab = (hash ? tabs.find((t) => t.id === hash)?.id : tabs[0].id) as string;

			const apiUrl = new URL(page.url.toString());
			if (activeTab === '#maps') {
				apiUrl.searchParams.delete('mymap');
			} else {
				apiUrl.searchParams.set('mymap', 'true');
			}
			await reload(apiUrl);
		}
	};

	const handleTabChanged = async (activeTab: string) => {
		const apiUrl = new URL(page.url.toString());
		offset = 0;
		apiUrl.searchParams.set('offset', `${offset}`);

		if (activeTab === '#maps') {
			apiUrl.searchParams.delete('mydata');
		} else {
			apiUrl.searchParams.set('mydata', 'true');
		}

		await reload(apiUrl);
	};

	onMount(() => {
		if (data.session) {
			tabs = [
				{
					id: '#maps',
					label: TabNames.MAPS
				},
				{
					id: '#mymap',
					label: TabNames.MY_MAP
				}
			];
		}
		loadActiveTab();
	});
</script>

<HeroHeader title="Maps" bind:breadcrumbs bind:tabs bind:activeTab onTabChange={handleTabChanged} />

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
					{#snippet control()}
						<div>
							<div class="select mt-auto">
								<select bind:value={limit} onchange={handleLimitChanged}>
									{#each LimitOptions as limit (limit)}
										<option value={limit}>{limit}</option>
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
								<select bind:value={sortby} onchange={handleSortbyChanged}>
									{#each MapSortingColumns as option (option.value)}
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
									{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }
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
			<SearchExpand
				bind:value={query}
				open={true}
				placeholder="Type keywords..."
				onchange={handleFilterInput}
				iconSize={20}
				fontSize={6}
				timeout={SearchDebounceTime}
				disabled={!mapData}
				loading={!mapData}
			/>

			{#if page.data.session}
				<div class="py-2">
					<FieldControl title="Access Level" showHelp={false}>
						{#snippet control()}
							<div>
								<AccessLevelSwitcher
									bind:accessLevel
									onchange={handleAccessLevelChanged}
									isSegmentButton={false}
								/>
							</div>
						{/snippet}
					</FieldControl>
				</div>

				<div class="py-2">
					<Checkbox
						label="Show starred only"
						bind:checked={onlyStar}
						onclick={handleClickFavourite}
					/>
				</div>
			{/if}
		</div>
		<div class="column">
			<MapStyleCardList bind:mapData onreload={handlePaginationClicked} bind:viewType />
		</div>
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.header-content {
		margin: 48px 0;
	}
</style>
