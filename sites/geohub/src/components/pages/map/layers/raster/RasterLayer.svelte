<script lang="ts">
	import { page } from '$app/stores';
	import OpacityPanel from '$components/maplibre/OpacityPanel.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import RasterHistogram from '$components/pages/map/layers/raster/RasterHistogram.svelte';
	import RasterLegend from '$components/pages/map/layers/raster/RasterLegend.svelte';
	import RasterTransform from '$components/pages/map/layers/raster/RasterTransform.svelte';
	import { LegendTypes, TabNames } from '$lib/config/AppConfig';
	import { handleEnterKey, isRgbRaster, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import { NUMBER_OF_CLASSES_CONTEXT_KEY, createNumberOfClassesStore, layerList } from '$stores';
	import { setContext } from 'svelte';

	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	export let layer: Layer;

	// let numberOfClasses = $page.data.config.NumberOfClasses;
	let legendType: LegendTypes;
	const rasterInfo: RasterTileMetadata = layer.info;
	const isRgbTile = isRgbRaster(rasterInfo.colorinterp);

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
		{ label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
		{ label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
		{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }
	];

	let activeTab = layer.activeTab ?? TabNames.LEGEND;

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [
			{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
			{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }
		];
	}

	const layerListStorageKey = storageKeys.layerList($page.url.host);

	$: activeTab, setActiveTab2store();
	const setActiveTab2store = () => {
		if (!($layerList?.length > 0)) return;
		layerList.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerList);
	};
</script>

<LayerTemplate {layer}>
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
			<RasterLegend bind:layer bind:legendType />
		{/if}
		{#if !isRgbTile}
			{#if activeTab === TabNames.HISTOGRAM}
				<RasterHistogram bind:layer />
			{/if}
			{#if activeTab === TabNames.TRANSFORM}
				<RasterTransform bind:layer />
			{/if}
		{/if}
		{#if activeTab === TabNames.OPACITY}
			<OpacityPanel {layer} />
		{/if}
	</p>
</LayerTemplate>
