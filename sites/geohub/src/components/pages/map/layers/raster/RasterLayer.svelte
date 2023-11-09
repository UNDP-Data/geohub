<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import RasterTransform from '$components/pages/map/layers/raster/RasterTransform.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		getRandomColormap,
		handleEnterKey,
		isRgbRaster,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		createClassificationMethodStore,
		createColorMapNameStore,
		createNumberOfClassesStore,
		createRasterRescaleStore,
		layerList
	} from '$stores';
	import { setContext } from 'svelte';

	export let layer: Layer;

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);
	colorMapNameStore.subscribe((value) => {
		layerList.setColorMapName(layer.id, value);
	});

	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);
	classificationMethod.subscribe((value) => {
		layerList.setClassificationMethod(layer.id, value);
	});

	const rasterInfo: RasterTileMetadata = layer.info;
	const isRgbTile = isRgbRaster(rasterInfo.colorinterp);

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
		{ label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' }
	];

	let activeTab = layer.activeTab ?? TabNames.LEGEND;

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' }];
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

	<div class="panel-content px-2 pb-2">
		<div hidden={activeTab !== TabNames.LEGEND}>
			<RasterLegend
				bind:layerId={layer.id}
				bind:metadata={layer.info}
				bind:tags={layer.dataset.properties.tags}
			/>
		</div>
		{#if !isRgbTile}
			<div hidden={activeTab !== TabNames.TRANSFORM}>
				<RasterTransform bind:layer />
			</div>
		{/if}
	</div>
</LayerTemplate>
