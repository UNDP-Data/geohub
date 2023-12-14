<script lang="ts">
	import { page } from '$app/stores';
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
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
	import { setContext } from 'svelte';
	import SimpleLayerTemplate from '../SimpleLayerTemplate.svelte';

	export let layer: Layer;

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
</script>

<SimpleLayerTemplate {layer}>
	<div class="panel-content px-2 pb-2" slot="content">
		<RasterLegend
			bind:layerId={layer.id}
			bind:metadata={layer.info}
			bind:tags={layer.dataset.properties.tags}
		/>
	</div>
</SimpleLayerTemplate>
