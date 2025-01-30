<script lang="ts">
	import { page } from '$app/state';
	import VectorFilter from '$components/pages/map/layers/vector/VectorFilter.svelte';
	import VectorLabelPanel from '$components/pages/map/layers/vector/VectorLabelPanel.svelte';
	import VectorLegend from '$components/pages/map/layers/vector/VectorLegend.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer, Tag } from '$lib/types';
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
	import {
		MAPSTORE_CONTEXT_KEY,
		Tabs,
		getRandomColormap,
		type MapStore,
		type Tab,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount, setContext } from 'svelte';
	import LayerInfo from '../LayerInfo.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	interface Props {
		layer: Layer;
	}

	let { layer = $bindable() }: Props = $props();

	let metadata = $state(layer.info as VectorTileMetadata);

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
	$classificationMethod = layer.classificationMethod ?? page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);
	classificationMethod.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value);
	});

	// value (icon size/line width) classification
	const classificationMethod2 = createClassificationMethodStore();
	$classificationMethod2 = layer.classificationMethod_2 ?? page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY_2, classificationMethod2);
	classificationMethod2.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value, 'value');
	});

	// for label color classification
	const classificationMethodLabel = createClassificationMethodStore();
	$classificationMethodLabel =
		layer.classificationMethodLabel ?? page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL, classificationMethodLabel);
	classificationMethodLabel.subscribe((value) => {
		layerListStore.setClassificationMethod(layer.id, value, 'label');
	});

	// for color
	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	// for size/width
	const numberOfClassesStore2 = createNumberOfClassesStore();
	$numberOfClassesStore2 = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2, numberOfClassesStore2);

	// for label
	const numberOfClassesStoreLabel = createNumberOfClassesStore();
	$numberOfClassesStoreLabel = page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL, numberOfClassesStoreLabel);

	// for style color
	const defaultColorStore = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY, defaultColorStore);

	// for label color
	const defaultColorStoreLabel = createDefaultColorStore();
	setContext(DEFAULTCOLOR_CONTEXT_KEY_LABEL, defaultColorStoreLabel);

	let tabs: Tab[] = $state([
		{ label: TabNames.STYLE, id: TabNames.STYLE },
		{ label: TabNames.FILTER, id: TabNames.FILTER },
		{ label: TabNames.LABEL, id: TabNames.LABEL },
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
		<VectorLegend layerId={layer?.id} {metadata} tags={layer?.dataset?.properties.tags as Tag[]} />
	</div>
	<div hidden={activeTab !== TabNames.FILTER}>
		<VectorFilter {layer} />
	</div>
	<div hidden={activeTab !== TabNames.LABEL}>
		<VectorLabelPanel {layer} bind:metadata />
	</div>
	<div hidden={activeTab !== TabNames.INFO}>
		<LayerInfo {layer} />
	</div>
</div>
