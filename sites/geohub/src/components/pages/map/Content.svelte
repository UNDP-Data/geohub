<script lang="ts">
	import { page } from '$app/stores';
	import DataView from '$components/pages/map/data/DataView.svelte';
	import LayerList from '$components/pages/map/layers/LayerList.svelte';
	import Tabs from '$components/util/Tabs.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { PAGE_DATA_LOADING_CONTEXT_KEY, layerList, type PageDataLoadingStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);

	export let splitterHeight: number;
	let tabsHeight: number;
	$: contentHeight = splitterHeight - tabsHeight;

	let tabs = [
		{
			id: TabNames.DATA,
			label: `${TabNames.DATA}`,
			icon: 'fas fa-database'
		},
		{
			id: TabNames.LAYERS,
			label: `${TabNames.LAYERS}`,
			icon: 'fas fa-layer-group'
		}
	];

	let activeTab: TabNames = TabNames.DATA;

	$: $layerList, updateLayerLabel();
	const updateLayerLabel = () => {
		let defaultTab = $layerList.length > 0 ? TabNames.LAYERS : TabNames.DATA;
		let defaultActiveTab = ($page.url.searchParams.get('activetab') ?? defaultTab) as TabNames;
		if (
			!(defaultActiveTab && [`${TabNames.DATA}`, `${TabNames.LAYERS}`].includes(defaultActiveTab))
		) {
			defaultActiveTab = defaultTab;
		}
		activeTab = defaultActiveTab;

		let label = `${TabNames.LAYERS}`;
		if ($layerList.length > 0) {
			label = `${label} (${$layerList.length})`;
		}
		tabs[1].label = label;
	};

	const handleClickTab = (e) => {
		activeTab = e.detail;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		history.replaceState({}, null, url.toString());
	};
</script>

<div class="is-fullwidth" bind:clientHeight={tabsHeight}>
	<Tabs
		size="is-medium"
		isBoxed={false}
		isFullwidth={true}
		bind:tabs
		bind:activeTab
		on:tabChange={handleClickTab}
	/>
</div>

{#if $pageDataLoadingStore === true}
	<div class="is-flex is-justify-content-center is-align-items-center" style="margin-top: 40%;">
		<Loader size="medium" />
	</div>
{/if}

{#if $pageDataLoadingStore !== true}
	<div hidden={activeTab !== TabNames.DATA}>
		<DataView bind:contentHeight />
	</div>
	<div hidden={activeTab !== TabNames.LAYERS}>
		<LayerList bind:contentHeight bind:activeTab />
	</div>
{/if}
