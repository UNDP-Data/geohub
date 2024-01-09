<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import DataView from '$components/pages/map/data/DataView.svelte';
	import LayerList from '$components/pages/map/layers/LayerList.svelte';
	import Tabs, { type Tab } from '$components/util/Tabs.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		type LayerListStore,
		type PageDataLoadingStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);

	export let splitterHeight: number;
	let tabsHeight: number;
	$: contentHeight = splitterHeight - tabsHeight;

	let tabs: Tab[] = [
		{
			id: TabNames.DATA,
			label: `${TabNames.DATA}`
		},
		{
			id: TabNames.LAYERS,
			label: `${TabNames.LAYERS}`
		}
	];

	let activeTab: TabNames = TabNames.DATA;

	$: $layerListStore, updateLayerLabel();
	const updateLayerLabel = () => {
		let defaultTab = $layerListStore.length > 0 ? TabNames.LAYERS : TabNames.DATA;
		let defaultActiveTab = ($page.url.searchParams.get('activetab') ?? defaultTab) as TabNames;
		if (
			!(defaultActiveTab && [`${TabNames.DATA}`, `${TabNames.LAYERS}`].includes(defaultActiveTab))
		) {
			defaultActiveTab = defaultTab;
		}
		activeTab = defaultActiveTab;

		const layerTab = tabs.find((t) => t.id === TabNames.LAYERS);
		layerTab.counter = $layerListStore.length;
		tabs = [...tabs];
	};

	const handleClickTab = (e) => {
		activeTab = e.detail;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		replaceState(url, '');
	};
</script>

<div class="is-fullwidth" bind:clientHeight={tabsHeight}>
	<Tabs
		size="is-normal"
		isBoxed={false}
		isFullwidth={false}
		bind:tabs
		bind:activeTab
		on:tabChange={handleClickTab}
		isUppercase={true}
		fontWeight="semibold"
	/>
</div>

{#if $pageDataLoadingStore === true}
	<div class="is-flex is-justify-content-center is-align-items-center" style="margin-top: 40%;">
		<Loader size="medium" />
	</div>
{/if}

{#if $pageDataLoadingStore !== true}
	<div hidden={activeTab !== TabNames.DATA} class="mx-4">
		<DataView bind:contentHeight />
	</div>
	<div hidden={activeTab !== TabNames.LAYERS}>
		<LayerList bind:contentHeight bind:activeTab />
	</div>
{/if}
