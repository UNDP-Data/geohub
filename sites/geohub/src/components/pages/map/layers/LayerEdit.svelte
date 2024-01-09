<script lang="ts">
	import FloatingPanel from '$components/util/FloatingPanel.svelte';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		createLegendReadonlyStore,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LegendReadonlyStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';
	import RasterLayer from './raster/RasterLayer.svelte';
	import VectorLayer from './vector/VectorLayer.svelte';

	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = false;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	const handleClose = () => {
		$editingLayerStore = undefined;
		$editingMenuShownStore = false;
	};
</script>

{#if $editingLayerStore}
	<div class="layer-editor">
		<FloatingPanel title={$editingLayerStore.name} on:close={handleClose}>
			<div class="editor-contents">
				{#if $editingLayerStore.dataset.properties.is_raster === true}
					<RasterLayer bind:layer={$editingLayerStore} />
				{:else}
					<VectorLayer bind:layer={$editingLayerStore} />
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
