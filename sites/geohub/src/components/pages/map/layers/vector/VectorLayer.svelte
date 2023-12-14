<script lang="ts">
	import { page } from '$app/stores';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import SimpleLayerTemplate from '$components/pages/map/layers/SimpleLayerTemplate.svelte';
	import VectorFilter from '$components/pages/map/layers/vector/VectorFilter.svelte';
	import VectorLabelPanel from '$components/pages/map/layers/vector/VectorLabelPanel.svelte';
	import VectorParamsPanel from '$components/pages/map/layers/vector/VectorParamsPanel.svelte';
	import Tabs from '$components/util/Tabs.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		getLayerStyle,
		getRandomColormap,
		loadMap,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		LAYERLISTSTORE_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createNumberOfClassesStore,
		type LayerListStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import Legend from '../header/Legend.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;

	let metadata = layer.info as VectorTileMetadata;
	let isSimpleLegend = true;

	// colormap for geometry
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

	let activeTab = layer.activeTab ?? TabNames.LEGEND;

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list', id: TabNames.LEGEND },
		{ label: TabNames.FILTER, icon: 'fa-solid fa-filter', id: TabNames.FILTER },
		{ label: TabNames.LABEL, icon: 'fa-solid fa-text-height', id: TabNames.LABEL }
	];

	let isFunctionLayer =
		layer?.dataset?.properties?.tags?.find((t) => t.key == 'layertype')?.value === 'function' ??
		false;

	if (isFunctionLayer) {
		tabs = [
			...tabs,
			{
				label: TabNames.SIMULATION,
				icon: 'fa-solid fa-person-circle-question',
				id: TabNames.SIMULATION
			}
		];
	}

	const init = async () => {
		const isLoaded = await loadMap($map);
		return isLoaded;
	};

	const layerListStorageKey = storageKeys.layerList($page.url.host);

	$: activeTab, setActiveTab2store();
	const setActiveTab2store = () => {
		if (!($layerListStore?.length > 0)) return;
		layerListStore.setActiveTab(layer.id, activeTab);
		toLocalStorage(layerListStorageKey, $layerListStore);
	};

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};
</script>

{#if !$legendReadonly}
	<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged}>
		{#await init()}
			<div class="loader-container">
				<Loader size="small" />
			</div>
		{:then}
			{#if !$legendReadonly}
				<Tabs bind:tabs bind:activeTab on:tabChange={(e) => (activeTab = e.detail)} />
			{/if}

			<div class="panel-content px-2 pb-2">
				<div hidden={activeTab !== TabNames.LEGEND}>
					<VectorLegend bind:layerId={layer.id} bind:metadata />
				</div>
				{#if !$legendReadonly}
					<div hidden={activeTab !== TabNames.FILTER}>
						<VectorFilter {layer} />
					</div>
					<div hidden={activeTab !== TabNames.LABEL}>
						<VectorLabelPanel {layer} bind:metadata />
					</div>
					{#if isFunctionLayer}
						<div hidden={activeTab !== TabNames.SIMULATION}>
							<VectorParamsPanel layerId={layer.id} />
						</div>
					{/if}
				{/if}
			</div>
		{/await}
	</LayerTemplate>
{:else}
	{@const layerStyle = getLayerStyle($map, layer.id)}
	<SimpleLayerTemplate {layer}>
		<div slot="legend">
			<Legend layer={layerStyle} bind:isSimpleLegend />
		</div>
		<div slot="content">
			{#if !isSimpleLegend}
				<div class="panel-content px-2 pb-2">
					<VectorLegend bind:layerId={layer.id} bind:metadata />
				</div>
			{/if}
		</div>
	</SimpleLayerTemplate>
{/if}

<style lang="scss">
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}
</style>
