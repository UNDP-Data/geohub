<script lang="ts">
	import { clean, getLayerStyle } from '$lib/helper';
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

	let isExpanded = true;

	const handleClose = () => {
		$editingLayerStore = undefined;
		$editingMenuShownStore = false;
	};
</script>

{#if $editingLayerStore}
	{@const type = getLayerStyle($map, $editingLayerStore.id)?.type}
	<div class="layer-editor">
		<div class="editor-header has-background-light is-flex is-align-items-center px-2">
			<span class="layer-name is-size-6">{clean($editingLayerStore.name)}</span>
			<div class="header-buttons pl-2">
				<button
					class="button px-0 chevron-button {isExpanded ? 'is-expanded' : ''}"
					on:click={() => {
						isExpanded = !isExpanded;
					}}
				>
					<span class="icon is-small">
						<i class="fa-solid fa-chevron-down"></i>
					</span>
				</button>
				<button class="button pl-2" on:click={handleClose}>
					<span class="icon is-small">
						<i class="fas fa-xmark"></i>
					</span>
				</button>
			</div>
		</div>
		<div class="editor-contents px-2 pb-2" hidden={!isExpanded}>
			{#if type}
				{#if type === 'raster'}
					<RasterLayer bind:layer={$editingLayerStore} />
				{:else}
					<VectorLayer bind:layer={$editingLayerStore} />
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.layer-editor {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 350px;

		z-index: 20;
		background-color: white;

		.editor-header {
			.layer-name {
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				word-break: break-all;
			}

			.header-buttons {
				margin-left: auto;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 5px;

				.chevron-button {
					-webkit-transition: all 0.3s ease;
					-moz-transition: all 0.3s ease;
					-ms-transition: all 0.3s ease;
					-o-transition: all 0.3s ease;
					transition: all 0.3s ease;

					&.is-expanded {
						transform: rotate(-180deg);
						-webkit-transform: rotate(-180deg);
						-moz-transform: rotate(-180deg);
						-ms-transform: rotate(-180deg);
						-o-transform: rotate(-180deg);
						transition: rotateZ(-180deg);
					}
				}
				.button {
					border: none;
					background: transparent;
				}
			}
		}

		.editor-contents {
			overflow-y: auto;
			max-height: 70vh;
		}
	}
</style>
