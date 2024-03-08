<script lang="ts">
	import RasterSimpleLegend from '$components/maplibre/raster/RasterSimpleLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;
	export let showEditButton = false;

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};

	const existLayerInMap = $map.getStyle().layers.find((l) => l.id === layer.id) ? true : false;
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged} bind:showEditButton>
	<div slot="content">
		{#if existLayerInMap}
			<RasterSimpleLegend
				bind:layerId={layer.id}
				bind:metadata={layer.info}
				bind:tags={layer.dataset.properties.tags}
				bind:links={layer.dataset.properties.links}
			/>
		{:else}
			<Notification type="warning" showCloseButton={false}>
				You have no permission to access this dataset
			</Notification>
		{/if}
	</div>
</LayerTemplate>
