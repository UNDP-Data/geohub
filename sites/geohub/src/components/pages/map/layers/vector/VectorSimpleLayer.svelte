<script lang="ts">
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;
	export let showEditButton = false;

	let metadata = layer.info as VectorTileMetadata;

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged} bind:showEditButton>
	<div slot="content">
		<div class="panel-content px-2 pb-2">
			<VectorLegend
				bind:layerId={layer.id}
				bind:metadata
				bind:tags={layer.dataset.properties.tags}
			/>
		</div>
	</div>
</LayerTemplate>

<style lang="scss">
</style>
