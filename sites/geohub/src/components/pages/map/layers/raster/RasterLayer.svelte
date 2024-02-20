<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import RasterTransform from '$components/pages/map/layers/raster/RasterTransform.svelte';
	import Tabs, { type Tab } from '$components/util/Tabs.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { getRandomColormap, isRgbRaster, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		createClassificationMethodStore,
		createColorMapNameStore,
		createNumberOfClassesStore,
		createRasterRescaleStore,
		type LayerListStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	import LayerInfo from '../LayerInfo.svelte';

	export let layer: Layer;

	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);
	colorMapNameStore.subscribe((value) => {
		layerListStore.setColorMapName(layer.id, value);
	});

	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);
	classificationMethod.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value);
	});

	const rasterInfo: RasterTileMetadata = layer.info;
	const isRgbTile = isRgbRaster(rasterInfo.colorinterp);

	let tabs: Tab[] = [
		{ label: TabNames.STYLE, id: TabNames.STYLE },
		{ label: TabNames.TRANSFORM, id: TabNames.TRANSFORM },
		{ label: TabNames.INFO, id: TabNames.INFO }
	];

	const getDefaultTab = () => {
		if (layer.activeTab) {
			const tab = tabs.find((t) => t.id === layer.activeTab);
			if (tab) {
				return tab.id as TabNames;
			}
		}
		return TabNames.STYLE;
	};

	let activeTab: TabNames = getDefaultTab();

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [
			{ label: TabNames.STYLE, id: TabNames.STYLE },
			{ label: TabNames.INFO, id: TabNames.INFO }
		];
	}

	const layerListStorageKey = storageKeys.layerList($page.url.host);

	$: activeTab, setActiveTab2store();
	const setActiveTab2store = () => {
		if (!($layerListStore?.length > 0)) return;
		layerListStore.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerListStore);
	};
</script>

<Tabs
	bind:tabs
	bind:activeTab
	on:tabChange={(e) => (activeTab = e.detail)}
	size="is-normal"
	fontWeight="bold"
	isUppercase={true}
	isBoxed={false}
/>

<div class="editor-contents" hidden={activeTab !== TabNames.STYLE}>
	<RasterLegend
		bind:layerId={layer.id}
		bind:metadata={layer.info}
		bind:tags={layer.dataset.properties.tags}
		bind:links={layer.dataset.properties.links}
	/>
</div>
{#if !isRgbTile}
	<div class="editor-contents px-4 pb-4" hidden={activeTab !== TabNames.TRANSFORM}>
		<RasterTransform bind:layer />
	</div>
{/if}
<div class="editor-contents" hidden={activeTab !== TabNames.INFO}>
	<LayerInfo {layer} />
</div>

<style lang="scss">
	.editor-contents {
		overflow-y: auto;
		max-height: 60vh;
	}
</style>
