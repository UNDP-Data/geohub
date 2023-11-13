<script lang="ts">
	import { page } from '$app/stores';
	import DataView from '$components/pages/map/data/DataView.svelte';
	import LayerList from '$components/pages/map/layers/LayerList.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { layerList } from '$stores';
	import Tabs from '$components/util/Tabs.svelte';

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

<Tabs bind:tabs bind:activeTab on:tabChange={handleClickTab} />

<div hidden={activeTab !== TabNames.DATA}>
	<DataView bind:contentHeight />
</div>
<div hidden={activeTab !== TabNames.LAYERS}>
	<LayerList bind:contentHeight bind:activeTab />
</div>
