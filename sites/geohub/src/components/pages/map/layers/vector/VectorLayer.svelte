<script lang="ts">
	import { page } from '$app/stores';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import VectorFilter from '$components/pages/map/layers/vector/VectorFilter.svelte';
	import VectorLabelPanel from '$components/pages/map/layers/vector/VectorLabelPanel.svelte';
	import VectorParamsPanel from '$components/pages/map/layers/vector/VectorParamsPanel.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		getRandomColormap,
		handleEnterKey,
		loadMap,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		createClassificationMethodStore,
		createColorMapNameStore,
		createNumberOfClassesStore,
		layerList,
		type MapStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext, setContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	let metadata = layer.info as VectorTileMetadata;

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

	// for color
	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	// for size/width
	const numberOfClassesStore2 = createNumberOfClassesStore();
	$numberOfClassesStore2 = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2, numberOfClassesStore2);

	let activeTab = layer.activeTab ?? TabNames.LEGEND;

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
		{ label: TabNames.FILTER, icon: 'fa-solid fa-filter' },
		{ label: TabNames.LABEL, icon: 'fa-solid fa-text-height' }
	];

	let isFunctionLayer =
		layer?.dataset?.properties?.tags?.find((t) => t.key == 'layertype')?.value === 'function' ??
		false;

	if (isFunctionLayer) {
		tabs = [...tabs, { label: TabNames.SIMULATION, icon: 'fa-solid fa-person-circle-question' }];
	}

	const init = async () => {
		const isLoaded = await loadMap($map);
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

		<div class="panel-content px-2 pb-2">
			<div hidden={activeTab !== TabNames.LEGEND}>
				<VectorLegend bind:layerId={layer.id} bind:metadata />
			</div>
			<div hidden={activeTab !== TabNames.FILTER}>
				<VectorFilter {layer} />
			</div>
			<div hidden={activeTab !== TabNames.LABEL}>
				<VectorLabelPanel {layer} />
			</div>
			{#if isFunctionLayer}
				<div hidden={activeTab !== TabNames.SIMULATION}>
					<VectorParamsPanel layerId={layer.id} />
				</div>
			{/if}
		</div>
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
