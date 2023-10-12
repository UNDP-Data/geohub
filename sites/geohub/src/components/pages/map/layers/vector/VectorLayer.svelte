<script lang="ts">
	import { page } from '$app/stores';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import OpacityPanel from '$components/maplibre/OpacityPanel.svelte';
	import VectorLabelPanel from '$components/pages/map/layers/vector/VectorLabelPanel.svelte';
	import VectorLegend from '$components/pages/map/layers/vector/VectorLegend.svelte';
	import { LegendTypes, TabNames, VectorApplyToTypes } from '$lib/config/AppConfig';
	import {
		getLayerSourceUrl,
		handleEnterKey,
		loadArgumentsInDynamicLayers,
		loadMap,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { layerList, spriteImageList, type MapStore, MAPSTORE_CONTEXT_KEY } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import VectorFilter from '$components/pages/map/layers/vector/VectorFilter.svelte';
	import VectorParamsPanel from '$components/pages/map/layers/vector/VectorParamsPanel.svelte';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	let applyToOption: VectorApplyToTypes = VectorApplyToTypes.COLOR;
	let legendType: LegendTypes;
	let defaultColor: string;
	let defaultLineColor: string;
	let activeTab = layer.activeTab ?? TabNames.LEGEND;

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
		{ label: TabNames.FILTER, icon: 'fa-solid fa-filter' },
		{ label: TabNames.LABEL, icon: 'fa-solid fa-text-height' },
		{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
		{ label: TabNames.SIMULATION, icon: 'fa-solid fa-person-circle-question' }
	];

	const layerType = layer?.dataset?.properties?.tags?.find((t) => t.key == 'layertype')?.['value'];

	const init = async () => {
		if (!layerType || layerType !== 'function') {
			tabs = tabs.filter((t) => t.label !== TabNames.SIMULATION);
			return;
		}
		const isLoaded = await loadMap($map);
		const args = await loadArgumentsInDynamicLayers(getLayerSourceUrl($map, layer.id) as string);
		console.log(args);
		if (Object.keys(args)?.length < 1) {
			tabs = tabs.filter((t) => t.label !== TabNames.SIMULATION);
		}
		return isLoaded;
	};

	const layerListStorageKey = storageKeys.layerList($page.url.host);

	$: activeTab, setActiveTab2store();
	const setActiveTab2store = () => {
		if (!($layerList?.length > 0)) return;
		layerList.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerList);
	};
</script>

<LayerTemplate {layer}>
	{#await init()}
		<div class="loader-container">
			<Loader size="small" />
		</div>
	{:then}
		<div class="tabs is-fullwidth">
			<ul>
				{#each tabs as tab}
					<li class={activeTab === tab.label ? 'is-active' : ''}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="tab"
							tabindex="0"
							class="px-1 py-1"
							on:click={() => (activeTab = tab.label)}
							on:keydown={handleEnterKey}
						>
							<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
							<span class="has-text-weight-semibold">{tab.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<p class="panel-content px-2 pb-2">
			{#if activeTab === TabNames.LEGEND}
				{#if $spriteImageList?.length > 0}
					<VectorLegend
						{layer}
						bind:applyToOption
						bind:legendType
						bind:defaultColor
						bind:defaultLineColor
					/>
				{:else}
					<div class="loader-container">
						<Loader size="small" />
					</div>
				{/if}
			{:else if activeTab === TabNames.FILTER}
				<VectorFilter {layer} />
			{:else if activeTab === TabNames.LABEL}
				<VectorLabelPanel {layer} />
			{:else if activeTab === TabNames.OPACITY}
				<OpacityPanel {layer} />
			{:else if activeTab === TabNames.SIMULATION}
				<VectorParamsPanel layerId={layer.id} />
			{/if}
		</p>
	{/await}
</LayerTemplate>

<style lang="scss">
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}
</style>
