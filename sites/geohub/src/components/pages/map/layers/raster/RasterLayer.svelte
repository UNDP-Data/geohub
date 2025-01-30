<script lang="ts">
	import { page } from '$app/state';
	import LayerInfo from '$components/pages/map/layers/LayerInfo.svelte';
	import RasterLegend from '$components/pages/map/layers/raster/RasterLegend.svelte';
	import RasterTransformSimple from '$components/pages/map/layers/raster/RasterTransformSimple.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { isRgbRaster, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
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
	import {
		MAPSTORE_CONTEXT_KEY,
		Tabs,
		getRandomColormap,
		type MapStore,
		type RasterTileMetadata,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount, setContext } from 'svelte';

	interface Props {
		layer: Layer;
	}

	let { layer = $bindable() }: Props = $props();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);
	colorMapNameStore.subscribe((value) => {
		layerListStore.setColorMapName(layer.id, value);
	});

	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);
	classificationMethod.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value);
	});

	const rasterInfo: RasterTileMetadata = layer.info as RasterTileMetadata;
	const isRgbTile = isRgbRaster(rasterInfo.colorinterp as string[]);

	let tabs: Tab[] = $state([
		{ label: TabNames.STYLE, id: TabNames.STYLE },
		{ label: TabNames.TRANSFORM, id: TabNames.TRANSFORM },
		{ label: TabNames.INFO, id: TabNames.INFO }
	]);

	const getDefaultTab = () => {
		if (layer.activeTab) {
			const tab = tabs.find((t) => t.id === layer.activeTab);
			if (tab) {
				return tab.id as TabNames;
			}
		}
		return TabNames.STYLE;
	};

	let activeTab: TabNames = $state(getDefaultTab());

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [
			{ label: TabNames.STYLE, id: TabNames.STYLE },
			{ label: TabNames.INFO, id: TabNames.INFO }
		];
	}

	const layerListStorageKey = storageKeys.layerList(page.url.host);

	const setActiveTab2store = () => {
		if (!($layerListStore?.length > 0)) return;
		layerListStore.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerListStore);
	};

	let mapHeight = $state(0);
	const updateMapHeight = () => {
		mapHeight = $map.getContainer().clientHeight - 160;
	};

	onMount(() => {
		if (!$map) return;
		$map.on('resize', updateMapHeight);
		updateMapHeight();
	});
</script>

<Tabs
	bind:tabs
	bind:activeTab
	onchange={(tab: string) => {
		activeTab = tab as TabNames;
		setActiveTab2store();
	}}
	size="is-normal"
	fontWeight="bold"
	isUppercase={true}
	isBoxed={false}
/>

<div class="editor-contents" style="max-height: {mapHeight}px; overflow-y: auto;">
	<div hidden={activeTab !== TabNames.STYLE}>
		<RasterLegend
			bind:layerId={layer.id}
			bind:metadata={layer.info as RasterTileMetadata}
			bind:tags={layer.dataset.properties.tags}
			bind:links={layer.dataset.properties.links}
		/>
	</div>
	{#if !isRgbTile}
		<div class="px-4 pb-4" hidden={activeTab !== TabNames.TRANSFORM}>
			<RasterTransformSimple bind:layer />
		</div>
	{/if}
	<div hidden={activeTab !== TabNames.INFO}>
		<LayerInfo {layer} />
	</div>
</div>

<style lang="scss">
	.editor-contents {
		overflow-y: auto;
	}
</style>
