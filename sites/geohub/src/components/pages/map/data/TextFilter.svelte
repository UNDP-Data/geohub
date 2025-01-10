<script lang="ts">
	import { page } from '$app/state';
	import { DatasetSortingColumns, SearchDebounceTime } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { PanelButton } from '@undp-data/svelte-undp-components';
	import { Checkbox, Radios, SearchExpand, type Radio } from '@undp-data/svelte-undp-design';
	import type { Map } from 'maplibre-gl';

	const config: UserConfig = page.data.config;

	interface Props {
		disabled: boolean;
		map: Map;
		placeholder: string;
		query?: string;
		onchange?: (url: string) => void;
	}

	let {
		disabled = $bindable(),
		map = $bindable(),
		placeholder,
		query = $bindable(page.url.searchParams.get('query') ?? ''),
		onchange = (url) => {
			console.log(url);
		}
	}: Props = $props();
	let queryType: 'and' | 'or' = $state(
		(page.url.searchParams.get('queryoperator') as 'and' | 'or') ??
			config.DatasetSearchQueryOperator
	);
	let queryTypes: Radio[] = $state([
		{
			label: 'Match all words typed',
			value: 'and'
		},
		{
			label: 'Match at least a word typed',
			value: 'or'
		}
	]);

	let sortingColumn: string = $state(
		page.url.searchParams.get('sortby') ?? config.DatasetSortingColumn
	);

	const bboxString = page.url.searchParams.get('bbox');
	const bboxArray = bboxString?.split(',').map((v) => Number(v));
	let bbox: [number, number, number, number] | undefined = $state(
		bboxString ? (bboxArray as [number, number, number, number]) : undefined
	);

	let isFilterByBBox: boolean = $state(bboxString ? true : false);

	const handleSortingColumnChanged = () => {
		const apiUrl = page.url;
		apiUrl.searchParams.delete('sortby');
		apiUrl.searchParams.set('sortby', sortingColumn);
		fireChangeEvent(apiUrl);
	};

	const handleQueryTypeChanged = () => {
		const apiUrl = page.url;
		apiUrl.searchParams.delete('queryoperator');
		apiUrl.searchParams.set('queryoperator', queryType);
		fireChangeEvent(apiUrl);
	};

	const handleFilterInput = () => {
		const apiUrl = page.url;
		apiUrl.searchParams.delete('query');
		if (query.length > 0) {
			apiUrl.searchParams.set('query', query);
		}
		fireChangeEvent(apiUrl);
	};

	const fireChangeEvent = (url: URL) => {
		if (onchange) onchange(url.toString());
	};

	const registerMapMovedEvent = async () => {
		if (!map) return;
		if (isFilterByBBox) {
			map.off('moveend', handleMapMoved);
			map.on('moveend', handleMapMoved);
		} else {
			map.off('moveend', handleMapMoved);
			bbox = undefined;
			const apiUrl = page.url;
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
			const apiUrl = page.url;
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

	<PanelButton
		icon="fas fa-arrow-down-short-wide fa-xl has-text-grey-dark"
		tooltip="Sort"
		{disabled}
		width="200px"
	>
		<p class="is-size-6 has-text-weight-semibold m-0 p-0 pb-2">Sort settings</p>

		<Radios
			radios={DatasetSortingColumns}
			bind:value={sortingColumn}
			groupName="sortby"
			isVertical={true}
			on:change={handleSortingColumnChanged}
		/>
	</PanelButton>

	<PanelButton
		icon="fas fa-gear fa-xl has-text-grey-dark"
		tooltip="Settings"
		{disabled}
		width="230px"
	>
		<p class="is-size-6 has-text-weight-semibold m-0 p-0">Search settings</p>
		<p class="subtitle is-6 pb-0 pt-2 my-1">Text search</p>

		<Radios
			bind:radios={queryTypes}
			bind:value={queryType}
			groupName="queryType"
			isVertical={true}
			on:change={handleQueryTypeChanged}
		/>
		<p class="subtitle is-6 pb-0 pt-2 my-1">Geospatial filter</p>
		<Checkbox
			label="Filter by current map extent"
			bind:checked={isFilterByBBox}
			on:clicked={registerMapMovedEvent}
		/>
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
