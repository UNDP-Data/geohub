<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PanelButton from '$components/controls/PanelButton.svelte';
	import TagFilter from '$components/data-view/TagFilter.svelte';
	import { DatasetSortingColumns } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { Checkbox, Radios, type Radio } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import type { Map } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const config: UserConfig = $page.data.config;

	export let disabled = false;
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
	let isTagFilterShow = false;

	$: isQueryEmpty = !query || query?.length === 0;
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

	const handleFilterInput = debounce(() => {
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('query');
		if (query.length > 0) {
			apiUrl.searchParams.set('query', query);
		}
		fireChangeEvent(apiUrl);
	}, 500);

	const clearInput = () => {
		query = '';

		const apiUrl = $page.url;
		apiUrl.searchParams.delete('query');
		fireChangeEvent(apiUrl);
	};

	const fireChangeEvent = async (url: URL) => {
		history.replaceState({}, null, url.toString());
		await invalidateAll();

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

	const handleTagChanged = (e) => {
		dispatch('tagchange', {
			tags: e.detail.tags
		});
	};

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<div class="filter-text pt-3">
	<div class="control has-icons-left filter-text-box">
		<input
			data-testid="filter-bucket-input"
			class="input"
			type="text"
			{disabled}
			{placeholder}
			on:input={handleFilterInput}
			bind:value={query}
		/>
		<span class="icon is-small is-left">
			<i class="fas fa-search" />
		</span>
		{#if !isQueryEmpty}
			<span
				class="clear-button"
				role="button"
				tabindex="0"
				on:click={clearInput}
				on:keydown={handleEnterKey}
			>
				<i class="fas fa-xmark sm" />
			</span>
		{/if}
	</div>

	<PanelButton
		icon="fas fa-sliders"
		tooltip="Explore tags and filter data"
		{disabled}
		bind:isShow={isTagFilterShow}
		width="300px"
	>
		<p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
		<p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
		<TagFilter bind:isShow={isTagFilterShow} on:change={handleTagChanged} />
	</PanelButton>

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

		.filter-text-box {
			position: relative;
			height: 35px;
			width: 100%;

			.clear-button {
				position: absolute;
				top: 6px;
				right: 8px;
				cursor: pointer;
			}
		}

		.subtitle {
			border-bottom: 1px solid gray;
			font-weight: bold;
		}

		// .radio-button {
		//   position: relative;
		//   top: 0.2rem;
		// }
	}
</style>
