<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		HEADER_HEIGHT_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLegendReadonlyStore,
		type EditingLayerStore,
		type HeaderHeightStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	import RasterLayer from './raster/RasterLayer.svelte';
	import VectorLayer from './vector/VectorLayer.svelte';

	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = false;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);
	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	let innerHeight: number;
	$: contentHeight = innerHeight - $headerHeightStore;
</script>

<svelte:window bind:innerHeight />

<div class="layer-editor p-2" style="height: {contentHeight}px;">
	{#if $editingLayerStore}
		{@const type = getLayerStyle($map, $editingLayerStore.id)?.type}
		{#if type}
			{#if type === 'raster'}
				<RasterLayer bind:layer={$editingLayerStore} />
			{:else}
				<VectorLayer bind:layer={$editingLayerStore} />
			{/if}
		{/if}
	{/if}
</div>

<style>
	.layer-editor {
		overflow-y: auto;
	}
</style>
