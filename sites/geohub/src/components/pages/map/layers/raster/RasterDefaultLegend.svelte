<script lang="ts">
	import RasterColorMap from '$components/maplibre/raster/RasterColorMap.svelte';
	import type { Layer } from '$lib/types';
	import { layerList } from '$stores';
	import RasterRescale from './RasterRescale.svelte';

	export let layerConfig: Layer;

	let contentWidth = 300;

	const handleColorMapChanged = (e) => {
		const { layerId, colorMapName } = e.detail;
		layerList.setColorMapName(layerId, colorMapName);
	};
</script>

<div class="columns is-mobile mr-5" bind:clientWidth={contentWidth}>
	<div class="column">
		<div class="group" data-testid="continuous-view-container">
			<RasterColorMap
				layerId={layerConfig.id}
				bind:metadata={layerConfig.info}
				bind:colorMapName={layerConfig.colorMapName}
				bind:contentWidth
				on:change={handleColorMapChanged}
			/>

			<div class="range-slider pt-5 px-2">
				<RasterRescale
					layerId={layerConfig.id}
					bind:metadata={layerConfig.info}
					bind:tags={layerConfig.dataset.properties.tags}
				/>
			</div>
		</div>
	</div>
</div>
