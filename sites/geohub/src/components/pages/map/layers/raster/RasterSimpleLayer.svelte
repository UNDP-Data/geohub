<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import { getRandomColormap } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		createClassificationMethodStore,
		createColorMapNameStore,
		createNumberOfClassesStore,
		createRasterRescaleStore
	} from '$stores';
	import { createEventDispatcher, setContext } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;

	const rescaleStore = createRasterRescaleStore();
	setContext(RASTERRESCALE_CONTEXT_KEY, rescaleStore);

	const numberOfClassesStore = createNumberOfClassesStore();
	$numberOfClassesStore = $page.data.config.NumberOfClasses;
	setContext(NUMBER_OF_CLASSES_CONTEXT_KEY, numberOfClassesStore);

	const colorMapNameStore = createColorMapNameStore();
	$colorMapNameStore = layer.colorMapName ?? getRandomColormap();
	setContext(COLORMAP_NAME_CONTEXT_KEY, colorMapNameStore);

	const classificationMethod = createClassificationMethodStore();
	$classificationMethod = layer.classificationMethod ?? $page.data.config.ClassificationMethod;
	setContext(CLASSIFICATION_METHOD_CONTEXT_KEY, classificationMethod);

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged}>
	<div class="panel-content px-2 pb-2" slot="content">
		<RasterLegend
			bind:layerId={layer.id}
			bind:metadata={layer.info}
			bind:tags={layer.dataset.properties.tags}
		/>
	</div>
</LayerTemplate>
