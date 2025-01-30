<script lang="ts">
	import { page } from '$app/state';
	import MapStyleCardList from '$components/pages/map/MapStyleCardList.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel, MapSortingColumns, SearchDebounceTime } from '$lib/config/AppConfig';
	import type { DashboardMapStyle, MapsData, TableViewType } from '$lib/types';
	import { FieldControl, SegmentButtons } from '@undp-data/svelte-undp-components';
	import { Checkbox, SearchExpand } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';

	interface Props {
		id: string;
		onselect?: (style: DashboardMapStyle) => void;
	}

	let { id = $bindable(), onselect = () => {} }: Props = $props();
	let mapData: MapsData | undefined = $state();

	let query = $state('');
	let accessLevel: AccessLevel = $state(AccessLevel.PUBLIC);
	let onlyStar = $state(false);
	let sortby = $state(page.data.config.MapPageSortingColumn);
	let offset = 0;
	let limit = 9;
	let viewType: TableViewType = $state(page.data.config.MapPageTableViewType);

	const fetchMapStyles = async (url?: string) => {
		if (!url) {
			const params: { [key: string]: string } = {
				accesslevel: `${accessLevel}`,
				limit: `${limit}`,
				offset: `${offset}`,
				sortby: sortby,
				staronly: `${onlyStar ? 'true' : 'false'}`
			};

			if (query.length > 0) {
				let queryForSearch = query;
				queryForSearch = normaliseQuery();
				if (queryForSearch && queryForSearch.length > 0) {
					params.query = queryForSearch;
				}
			}

			url = `/api/style?${Object.keys(params)
				.map((k) => `${k}=${params[k]}`)
				.join('&')}`;
		}

		mapData = undefined;

		const res = await fetch(url);
		if (!res.ok) {
			toast.push(res.statusText);
		}
		const styles: MapsData = await res.json();
		mapData = styles;
	};

	onMount(() => {
		fetchMapStyles();
	});

	const handlePaginationClicked = async (apiUrl: URL) => {
		await fetchMapStyles(apiUrl.href);
	};

	const handleAccessLevelChanged = async () => {
		await fetchMapStyles();
	};

	const handleSortbyChanged = async () => {
		offset = 0;
		await fetchMapStyles();
	};

	const handleClickFavourite = async () => {
		onlyStar = !onlyStar;
		offset = 0;
		await fetchMapStyles();
	};

	const normaliseQuery = () => {
		if (query.length > 0) {
			return query.trim().replace(/\s/g, ` and `);
		} else {
			return query;
		}
	};

	const handleFilterInput = async () => {
		offset = 0;
		await fetchMapStyles();
	};

	const handleViewTypeChanged = (value: string | number) => {
		viewType = value as TableViewType;
	};
</script>

<section class="header-content columns is-flex is-flex-wrap-wrap mx-0">
	<div class="column is-12-mobile is-flex is-justify-content-flex-end is-flex-wrap-wrap p-0">
		<div class="mr-2">
			<FieldControl title="Sort results" showHelp={false}>
				{#snippet control()}
					<div>
						<div class="select mt-auto">
							<select bind:value={sortby} onchange={handleSortbyChanged}>
								{#each MapSortingColumns as option}
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
			on:change={handleFilterInput}
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
					on:clicked={handleClickFavourite}
				/>
			</div>
		{/if}
	</div>
	<div class="column">
		<MapStyleCardList
			bind:mapData
			onreload={handlePaginationClicked}
			bind:viewType
			mode="select"
			{onselect}
			bind:selectedId={id}
		/>
	</div>
</div>
