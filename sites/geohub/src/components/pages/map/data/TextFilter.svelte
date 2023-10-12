<script lang="ts">
	import { page } from '$app/stores';
	import PanelButton from '$components/util/PanelButton.svelte';
	import { DatasetSortingColumns, SearchDebounceTime } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { Checkbox, Radios, SearchExpand, type Radio } from '@undp-data/svelte-undp-design';
	import type { Map } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const config: UserConfig = $page.data.config;

	export let disabled: boolean;
	export let map: Map;
	export let placeholder: string;
	export let query = $page.url.searchParams.get('query') ?? '';
	let queryType: 'and' | 'or' =
		($page.url.searchParams.get('queryoperator') as 'and' | 'or') ??
		config.DatasetSearchQueryOperator;
	let queryTypes: Radio[] = [
		{
			label: 'Match all words typed',
			value: 'and'
		},
		{
			label: 'Match at least a word typed',
			value: 'or'
		}
	];

	let sortingColumn: string = $page.url.searchParams.get('sortby') ?? config.DatasetSortingColumn;

	const bboxString = $page.url.searchParams.get('bbox');
	const bboxArray = bboxString?.split(',').map((v) => Number(v));
	let bbox: [number, number, number, number] = bboxString
		? (bboxArray as [number, number, number, number])
		: undefined;

	let isFilterByBBox: boolean = bboxString ? true : false;

	$: queryType, handleQueryTypeChanged();
	$: sortingColumn, handleSortingColumnChanged();

	const handleSortingColumnChanged = () => {
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('sortby');
		apiUrl.searchParams.set('sortby', sortingColumn);
		fireChangeEvent(apiUrl);
	};

	const handleQueryTypeChanged = () => {
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('queryoperator');
		apiUrl.searchParams.set('queryoperator', queryType);
		fireChangeEvent(apiUrl);
	};

	const handleFilterInput = () => {
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('query');
		if (query.length > 0) {
			apiUrl.searchParams.set('query', query);
		}
		fireChangeEvent(apiUrl);
	};

	const fireChangeEvent = (url: URL) => {
		dispatch('change', {
			url: url.toString()
		});
	};

	$: isFilterByBBox, registerMapMovedEvent();

	const registerMapMovedEvent = async () => {
		if (!map) return;
		if (isFilterByBBox) {
			map.off('moveend', handleMapMoved);
			map.on('moveend', handleMapMoved);
		} else {
			map.off('moveend', handleMapMoved);
			bbox = undefined;
			const apiUrl = $page.url;
			apiUrl.searchParams.delete('bbox');
			fireChangeEvent(apiUrl);
		}
		handleMapMoved();
	};

	const handleMapMoved = () => {
		if (!map) return;
		if (isFilterByBBox) {
			const bounds = map.getBounds();
			bbox = [
				bounds.getSouthWest().lng,
				bounds.getSouthWest().lat,
				bounds.getNorthEast().lng,
				bounds.getNorthEast().lat
			];
			const apiUrl = $page.url;
			apiUrl.searchParams.delete('bbox');
			apiUrl.searchParams.set('bbox', bbox.join(','));
			fireChangeEvent(apiUrl);
		}
	};
</script>

<div class="filter-text pt-3">
	<div class="search-field">
		<SearchExpand
			bind:value={query}
			open={true}
			{placeholder}
			on:change={handleFilterInput}
			iconSize={16}
			fontSize={6}
			timeout={SearchDebounceTime}
			{disabled}
			bind:loading={disabled}
		/>
	</div>

	<PanelButton icon="fas fa-arrow-down-short-wide" tooltip="Sort" {disabled} width="200px">
		<p class="title is-5 m-0 p-0 pb-2">Sort settings</p>

		<Radios
			radios={DatasetSortingColumns}
			bind:value={sortingColumn}
			groupName="sortby"
			isVertical={true}
		/>
	</PanelButton>

	<PanelButton icon="fas fa-gear" tooltip="Settings" position="left" {disabled} width="230px">
		<p class="title is-5 m-0 p-0">Search settings</p>
		<p class="subtitle is-6 pb-0 pt-2 my-1">Text search</p>

		<Radios
			bind:radios={queryTypes}
			bind:value={queryType}
			groupName="queryType"
			isVertical={true}
		/>
		<p class="subtitle is-6 pb-0 pt-2 my-1">Geospatial filter</p>
		<Checkbox label="Filter by current map extent" bind:checked={isFilterByBBox} />
	</PanelButton>
</div>

<style lang="scss">
	.filter-text {
		display: flex;

		.search-field {
			width: 100%;
		}

		.subtitle {
			border-bottom: 1px solid gray;
			font-weight: bold;
		}
	}
</style>
