<script lang="ts">
	import FloatingPanel from '$components/util/FloatingPanel.svelte';
	import { getLayerStyle } from '$lib/helper';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLegendReadonlyStore,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	import RasterLayer from './raster/RasterLayer.svelte';
	import VectorLayer from './vector/VectorLayer.svelte';

	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = false;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	const handleClose = () => {
		$editingLayerStore = undefined;
		$editingMenuShownStore = false;
	};
</script>

{#if $editingLayerStore}
	{@const type = getLayerStyle($map, $editingLayerStore.id)?.type}
	<div class="layer-editor">
		<FloatingPanel title={$editingLayerStore.name} on:close={handleClose}>
			<div class="editor-contents">
				{#if type}
					{#if type === 'raster'}
						<RasterLayer bind:layer={$editingLayerStore} />
					{:else}
						<VectorLayer bind:layer={$editingLayerStore} />
					{/if}
				{/if}
			</div>
		</FloatingPanel>
	</div>
{/if}

<style lang="scss">
	.layer-editor {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 350px;

		z-index: 20;
	}

	.editor-contents {
		overflow-y: auto;
		max-height: 70vh;
	}
</style>
