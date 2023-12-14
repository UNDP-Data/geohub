<script lang="ts">
	import { page } from '$app/stores';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import SimpleLayerTemplate from '$components/pages/map/layers/SimpleLayerTemplate.svelte';
	import { getLayerStyle, getRandomColormap } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createNumberOfClassesStore,
		type MapStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	import Legend from '../header/Legend.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerStyle = getLayerStyle($map, layer.id);

	let metadata = layer.info as VectorTileMetadata;
	let isSimpleLegend = true;

	// colormap for geometry
	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);

	// colormap for label
	const colorMapNameStoreLabel = createColorMapNameStore();
	$colorMapNameStoreLabel = layer.colorMapNameLabel ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY_LABEL, colorMapNameStoreLabel);

	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);

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
</script>

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

<style lang="scss">
</style>
