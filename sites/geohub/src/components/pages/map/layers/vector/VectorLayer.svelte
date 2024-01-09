<script lang="ts">
	import { page } from '$app/stores';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import VectorFilter from '$components/pages/map/layers/vector/VectorFilter.svelte';
	import VectorLabelPanel from '$components/pages/map/layers/vector/VectorLabelPanel.svelte';
	import Tabs from '$components/util/Tabs.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { getRandomColormap, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		CLASSIFICATION_METHOD_CONTEXT_KEY_2,
		CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL,
		COLORMAP_NAME_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		LAYERLISTSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createNumberOfClassesStore,
		type LayerListStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';

	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	export let layer: Layer;

	let metadata = layer.info as VectorTileMetadata;

	// colormap for geometry
	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);
	colorMapNameStore.subscribe((value) => {
		layerListStore.setColorMapName(layer.id, value);
	});

	// colormap for label
	const colorMapNameStoreLabel = createColorMapNameStore();
	$colorMapNameStoreLabel = layer.colorMapNameLabel ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY_LABEL, colorMapNameStoreLabel);
	colorMapNameStoreLabel.subscribe((value) => {
		layerListStore.setColorMapNameLabel(layer.id, value);
	});

	// for color classification
	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);
	classificationMethod.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value);
	});

	// value (icon size/line width) classification
	const classificationMethod2 = createClassificationMethodStore();
	$classificationMethod2 = layer.classificationMethod_2 ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY_2, classificationMethod2);
	classificationMethod2.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value, 'value');
	});

	// for label color classification
	const classificationMethodLabel = createClassificationMethodStore();
	$classificationMethodLabel =
		layer.classificationMethodLabel ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL, classificationMethodLabel);
	classificationMethodLabel.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value, 'label');
	});

	// for color
	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	// for size/width
	const numberOfClassesStore2 = createNumberOfClassesStore();
	$numberOfClassesStore2 = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2, numberOfClassesStore2);

	// for label
	const numberOfClassesStoreLabel = createNumberOfClassesStore();
	$numberOfClassesStoreLabel = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL, numberOfClassesStoreLabel);

	// for style color
	const defaultColorStore = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY, defaultColorStore);

	// for label color
	const defaultColorStoreLabel = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY_LABEL, defaultColorStoreLabel);

	let tabs = [
		{ label: TabNames.STYLE, icon: 'fa-solid fa-list', id: TabNames.STYLE },
		{ label: TabNames.FILTER, icon: 'fa-solid fa-filter', id: TabNames.FILTER },
		{ label: TabNames.LABEL, icon: 'fa-solid fa-text-height', id: TabNames.LABEL }
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

	const layerListStorageKey = storageKeys.layerList($page.url.host);

	$: activeTab, setActiveTab2store();
	const setActiveTab2store = () => {
		if (!($layerListStore?.length > 0)) return;
		layerListStore.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerListStore);
	};
</script>

<Tabs bind:tabs bind:activeTab on:tabChange={(e) => (activeTab = e.detail)} />

<div hidden={activeTab !== TabNames.STYLE}>
	<VectorLegend bind:layerId={layer.id} bind:metadata bind:tags={layer.dataset.properties.tags} />
</div>
<div hidden={activeTab !== TabNames.FILTER}>
	<VectorFilter {layer} />
</div>
<div hidden={activeTab !== TabNames.LABEL}>
	<VectorLabelPanel {layer} bind:metadata />
</div>
