<script lang="ts">
	import { page } from '$app/stores';
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import { getRandomColormap } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		createClassificationMethodStore,
		createColorMapNameStore,
		createDefaultColorStore,
		createNumberOfClassesStore
	} from '$stores';
	import { createEventDispatcher, setContext } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;
	export let showEditButton = false;

	let metadata = layer.info as VectorTileMetadata;

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

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged} bind:showEditButton>
	<div slot="content">
		<div class="panel-content px-2 pb-2">
			<VectorLegend bind:layerId={layer.id} bind:metadata />
		</div>
	</div>
</LayerTemplate>

<style lang="scss">
</style>
