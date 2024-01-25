<script lang="ts">
	import RasterSimpleLegend from '$components/maplibre/raster/RasterSimpleLegend.svelte';
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
	<div slot="content">
		<RasterSimpleLegend
			bind:layerId={layer.id}
			bind:metadata={layer.info}
			bind:tags={layer.dataset.properties.tags}
			bind:links={layer.dataset.properties.links}
		/>
	</div>
</LayerTemplate>
