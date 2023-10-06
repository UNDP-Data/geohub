<script lang="ts">
	import { page } from '$app/stores';
	import DataView from '$components/DataView.svelte';
	import LayerList from '$components/LayerList.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { handleEnterKey } from '$lib/helper';
	import { layerList } from '$stores';

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

	let activeTab: string = TabNames.DATA;

	$: $layerList, updateLayerLabel();
	const updateLayerLabel = () => {
		let defaultTab = $layerList.length > 0 ? TabNames.LAYERS : TabNames.DATA;
		let defaultActiveTab = $page.url.searchParams.get('activetab') ?? defaultTab;
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

	const handleClickTab = (tabId: string) => {
		activeTab = tabId;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		history.replaceState({}, null, url.toString());
	};
</script>

<div class="m-0 mt-2 tabs is-fullwidth" bind:clientHeight={tabsHeight}>
	<ul>
		{#each tabs as tab}
			<li class={`tab-${tab.id.toLowerCase()} ${activeTab === tab.id ? 'is-active' : ''}`}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					role="tab"
					tabindex="0"
					on:click={() => handleClickTab(tab.id)}
					on:keydown={handleEnterKey}
				>
					<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<div hidden={activeTab !== TabNames.DATA}>
	<DataView bind:contentHeight />
</div>
<div hidden={activeTab !== TabNames.LAYERS}>
	<LayerList bind:contentHeight />
</div>
