<script lang="ts">
	import VectorLegend from '$components/maplibre/vector/VectorLegend.svelte';
	import LayerTemplate from '$components/pages/map/layers/LayerTemplate.svelte';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let isExpanded: boolean;
	export let showEditButton = false;

	let metadata = layer.info as VectorTileMetadata;

	const handleToggleChanged = (e) => {
		dispatch('toggled', e.detail);
	};

	const existLayerInMap = $map.getStyle().layers.find((l) => l.id === layer.id) ? true : false;
</script>

<LayerTemplate {layer} bind:isExpanded on:toggled={handleToggleChanged} bind:showEditButton>
	<div slot="content">
		{#if existLayerInMap}
			<VectorLegend
				bind:layerId={layer.id}
				bind:metadata
				bind:tags={layer.dataset.properties.tags}
			/>
		{:else}
			<Notification type="warning" showCloseButton={false}>
				You have no permission to access this dataset
			</Notification>
		{/if}
	</div>
</LayerTemplate>

<style lang="scss">
</style>
