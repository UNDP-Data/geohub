<script lang="ts">
	import type { Layer } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { cloneDeep } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerId = layer.id;

	$: visibility = getVisibility();

	const getVisibility = (): 'visible' | 'none' => {
		const layerStyle = $map.getStyle().layers.find((l) => l.id === layer.id);
		let visibility: 'visible' | 'none' = 'visible';
		if (layerStyle && layerStyle.layout && layerStyle.layout.visibility) {
			visibility = layerStyle.layout.visibility;
		}
		return visibility;
	};

	const toggleVisibility = () => {
		visibility = visibility === 'visible' ? 'none' : 'visible';
		map.setLayoutProperty(layerId, 'visibility', visibility);

		const layerClone = cloneDeep(layer);
		const layerIndex = $layerListStore.findIndex((layer) => layer.id === layerId);
		$layerListStore[layerIndex] = layerClone;

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				if (!$map.getLayer(child.id)) return;
				map.setLayoutProperty(child.id, 'visibility', visibility);
			});
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			toggleVisibility();
		}
	};

	onMount(() => {
		$map.on('styledata', () => {
			visibility = getVisibility();
		});
	});
</script>

<div
	class="has-tooltip-bottom has-tooltip-arrow"
	data-tooltip={`${visibility === 'visible' ? 'Hide layer' : 'Show layer'}`}
>
	<div
		class="icon-selected"
		aria-label="Change layer visibility"
		tabindex="0"
		role="button"
		on:click={() => toggleVisibility()}
		on:keydown={handleKeyDown}
	>
		<i class="fa-solid {visibility === 'visible' ? 'fa-eye' : 'fa-eye-slash'} fa-lg" />
	</div>
</div>

<style lang="scss">
	.icon-selected {
		opacity: 0.5;
		display: inline;
		cursor: pointer;

		&:hover {
			opacity: 1;
		}
	}
</style>
