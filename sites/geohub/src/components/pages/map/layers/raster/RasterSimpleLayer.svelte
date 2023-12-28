<script lang="ts">
	import RasterLegend from '$components/maplibre/raster/RasterLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import type { Layer } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;
	export let showEditButton = false;

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged} bind:showEditButton>
	<div class="panel-content px-2 pb-2" slot="content">
		<RasterLegend
			bind:layerId={layer.id}
			bind:metadata={layer.info}
			bind:tags={layer.dataset.properties.tags}
		/>
	</div>
</LayerTemplate>
