<script lang="ts">
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	export let layer: LayerSpecification;
	export let relativeLayers: { [key: string]: string } = {};

	const tippyTooltip = initTooltipTippy();

	$: layerTitle = relativeLayers && relativeLayers[layer.id] ? relativeLayers[layer.id] : layer.id;

	const getLayerIndex = () => {
		const layers = $map?.getStyle()?.layers;
		const index = layers?.findIndex((l) => l.id === layer.id);
		return index;
	};

	const getTotalCount = () => {
		return $map?.getStyle()?.layers.length;
	};

	const checkIsFirstLayer = () => {
		const index = getLayerIndex();
		return index === 0;
	};

	const checkIsLastLayer = () => {
		const layers = $map?.getStyle()?.layers;
		const index = getLayerIndex();
		return index === layers.length - 1;
	};

	let isFirstLater = checkIsFirstLayer();
	let isLastLayer = checkIsLastLayer();

	const moveBefore = () => {
		const currentIndex = getLayerIndex();
		const layers = $map?.getStyle()?.layers;
		const beforeLayerId = layers[currentIndex - 1].id;
		$map.moveLayer(layer.id, beforeLayerId);
		isFirstLater = checkIsFirstLayer();
		isLastLayer = checkIsLastLayer();
		dispatch('layerOrderChanged');
	};

	const handleKeydownMoveBefore = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			moveBefore();
		}
	};

	const moveAfter = () => {
		const currentIndex = getLayerIndex();
		const layers = $map?.getStyle()?.layers;
		const afterLayerId = layers[currentIndex + 1].id;
		$map.moveLayer(afterLayerId, layer.id);
		isFirstLater = checkIsFirstLayer();
		isLastLayer = checkIsLastLayer();
		dispatch('layerOrderChanged');
	};

	const handleKeydownmoveAfter = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			moveAfter();
		}
	};
</script>

<div class="layer-container" style="cursor:'grab'};">
	<span class="draggable-icon" use:tippyTooltip={{ content: 'Drag to change order' }}>
		<i class="fa-solid fa-grip-vertical" />
	</span>
	{#if $layerListStore.find((l) => l.id === layer.id)}
		<div class="pr-1">
			<Legend bind:layer />
		</div>
	{/if}
	<div class="layer-name">
		{layerTitle}
	</div>
	<div class="layer-position">
		{getLayerIndex() + 1}/{getTotalCount()}
	</div>
	<div class="layer-order">
		{#if !isFirstLater}
			<span
				tabindex="0"
				role="button"
				class="sort-button"
				use:tippyTooltip={{ content: 'Bring backward in map' }}
				on:click={moveBefore}
				on:keydown={handleKeydownMoveBefore}
			>
				<i class="fa-solid fa-sort-up" />
			</span>
		{/if}
		{#if !isLastLayer}
			<span
				tabindex="0"
				role="button"
				class="sort-button"
				use:tippyTooltip={{ content: 'Bring forward in map' }}
				on:click={moveAfter}
				on:keydown={handleKeydownmoveAfter}
			>
				<i class="fa-solid fa-sort-down" />
			</span>
		{/if}
	</div>
</div>

<style lang="scss">
	.layer-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 0;
		height: 2.5rem;
		width: 100%;
		cursor: pointer;

		.draggable-icon {
			margin-left: 0.2rem;
			margin-right: 0.5rem;
		}

		.layer-name {
			font-family:
				system-ui,
				-apple-system,
				system-ui,
				'Helvetica Neue',
				Helvetica,
				Arial,
				sans-serif;
			font-size: 16px;
			font-weight: 400;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			text-transform: capitalize;
		}

		.layer-position {
			font-size: 9px;
			font-weight: 600;
			margin-right: 0.3rem;
			background-color: lightgreen;
			padding-top: 0.2rem;
			padding-left: 0.3rem;
			padding-right: 0.3rem;
			height: 20px;
		}

		.layer-order {
			display: flex;
			flex-direction: column;
			text-align: right;
			margin-bottom: 10px;
			padding-right: 0.5rem;

			.sort-button {
				cursor: pointer;
				height: 10px;
				width: 10px;
			}
		}
	}
</style>
