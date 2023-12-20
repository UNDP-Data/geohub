<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		// LAYERLISTSTORE_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLegendReadonlyStore,
		type EditingLayerStore,
		// type LayerListStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	// import type { Unsubscriber } from 'svelte/store';
	import RasterLayer from './raster/RasterLayer.svelte';
	import VectorLayer from './vector/VectorLayer.svelte';

	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	// const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = false;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	// let unsubscriber: Unsubscriber;
	// $: if ($editingLayerStore) {
	// 	unsubscriber = map?.subscribe(handleLayerStyleChanged);
	// }

	// $: if (!$editingLayerStore && unsubscriber) {
	// 	unsubscriber();
	// }

	// const handleLayerStyleChanged = () => {
	// 	console.log($editingLayerStore?.name);
	// 	$layerListStore = [...$layerListStore];
	// };
</script>

{#if $editingLayerStore}
	{@const type = getLayerStyle($map, $editingLayerStore.id)?.type}
	{#if type}
		{#if type === 'raster'}
			<RasterLayer bind:layer={$editingLayerStore} showHeader={false} />
		{:else}
			<VectorLayer bind:layer={$editingLayerStore} showHeader={false} />
		{/if}
	{/if}
{/if}
