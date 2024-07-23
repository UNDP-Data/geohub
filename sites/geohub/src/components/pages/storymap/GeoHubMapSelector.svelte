<script lang="ts">
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel, MapSortingColumns, SearchDebounceTime } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DashboardMapStyle, MapsData } from '$lib/types';
	import { initTooltipTippy, Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	const tippyTooltip = initTooltipTippy();

	export let id: string;
	let mapData: MapsData;

	let query = '';
	let accessLevel: AccessLevel = AccessLevel.PUBLIC;
	let onlyStar = false;
	let sortby = $page.data.config.MapPageSortingColumn;
	let offset = 0;
	let limit = 8;

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

	const handleSelect = (style: DashboardMapStyle) => {
		dispatch('select', { style });
	};

	const handlePaginationClicked = async (url: string) => {
		await fetchMapStyles(url);
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
</script>

<div class="mb-4">
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

<div class="is-flex is-justify-content-flex-end mb-4">
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

{#if !mapData}
	<div class="is-flex is-justify-content-center">
		<Loader size="medium" />
	</div>
{:else if mapData.styles?.length > 0}
	<div class="columns is-multiline is-mobile">
		{#each mapData.styles as style}
			{@const styleLink = style.links.find((l) => l.rel === 'static-auto')?.href}
			{@const accessLevel = style.access_level}
			{@const accessIcon = getAccessLevelIcon(accessLevel, true)}

			<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
				<CardWithImage
					title={style.name}
					url=""
					tag="Map"
					image={styleLink.replace('{width}', '298').replace('{height}', '180')}
					width={298}
					height={180}
					linkName={id === style.id ? 'Already selected' : 'Use this map'}
					accent={id === style.id ? 'yellow' : 'blue'}
					icon={accessIcon}
					on:click={() => {
						handleSelect(style);
					}}
				/>
			</div>
		{/each}
	</div>

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
{:else}
	<div class="p-4">
		<Notification type="info" showCloseButton={false}>No map found</Notification>
	</div>
{/if}

<style lang="scss">
	.star-button {
		height: 40px;
		border: 1px solid #000;
	}
</style>
