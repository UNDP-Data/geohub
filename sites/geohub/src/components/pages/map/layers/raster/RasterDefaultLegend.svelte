<script lang="ts">
	import RasterColorMap from '$components/maplibre/raster/RasterColorMap.svelte';
	import type { Layer } from '$lib/types';
	import { layerList } from '$stores';
	import RasterRescale from './RasterRescale.svelte';

	export let layer: Layer;

	let contentWidth = 280;

	const handleColorMapChanged = (e) => {
		const { layerId, colorMapName } = e.detail;
		layerList.setColorMapName(layerId, colorMapName);
	};
</script>

<div class="is-flex is-flex-direction-column" bind:clientWidth={contentWidth}>
	<RasterColorMap
		layerId={layer.id}
		bind:metadata={layer.info}
		bind:colorMapName={layer.colorMapName}
		contentWidth={contentWidth - 20}
		on:change={handleColorMapChanged}
	/>

	<RasterRescale
		layerId={layer.id}
		bind:metadata={layer.info}
		bind:tags={layer.dataset.properties.tags}
	/>
</div>
