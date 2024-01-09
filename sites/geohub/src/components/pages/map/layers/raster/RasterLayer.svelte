<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import RasterHistogram from '$components/pages/map/layers/raster/RasterHistogram.svelte';
	import RasterTransform from '$components/pages/map/layers/raster/RasterTransform.svelte';
	import Tabs from '$components/util/Tabs.svelte';
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

	let tabs = [
		{ label: TabNames.STYLE, id: TabNames.STYLE },
		{ label: TabNames.TRANSFORM, id: TabNames.TRANSFORM },
		{ label: TabNames.HISTOGRAM, id: TabNames.HISTOGRAM }
	];

	const getDefaultTab = () => {
		if (layer.activeTab) {
			const tab = tabs.find((t) => t.id === layer.activeTab);
			if (tab) {
				return tab.id;
			}
		}
		return TabNames.STYLE;
	};

	let activeTab = getDefaultTab();

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [{ label: TabNames.STYLE, icon: 'fa-solid fa-list', id: TabNames.STYLE }];
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
	size="is-small"
	fontWeight="bold"
/>

<div hidden={activeTab !== TabNames.STYLE}>
	<RasterLegend
		bind:layerId={layer.id}
		bind:metadata={layer.info}
		bind:tags={layer.dataset.properties.tags}
	/>
</div>
<div hidden={activeTab !== TabNames.HISTOGRAM}>
	<RasterHistogram bind:metadata={layer.info} />
</div>
{#if !isRgbTile}
	<div hidden={activeTab !== TabNames.TRANSFORM}>
		<RasterTransform bind:layer />
	</div>
{/if}
