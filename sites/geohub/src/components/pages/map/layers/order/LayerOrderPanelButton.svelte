<script lang="ts">
	import LayerOrderPanel from '$components/pages/map/layers/order/LayerOrderPanel.svelte';
	import { LAYERLISTSTORE_CONTEXT_KEY, type LayerListStore } from '$stores';
	import {
		clean,
		initTippy,
		initTooltipTippy,
		MAPSTORE_CONTEXT_KEY,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { Checkbox } from '@undp-data/svelte-undp-design';
	import { getContext, untrack } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	let onlyRendered = $state(false);
	let onlyRelative = $state(true);
	let relativeLayers: { [key: string]: string } = $state({});

	const updateLayerOrderList = () => {
		if ($map && $layerListStore) {
			relativeLayers = {};
			$layerListStore.forEach((layer) => {
				relativeLayers[layer.id] = clean(layer.name);

				layer.children?.forEach((child) => {
					relativeLayers[child.id] = `${clean(layer.name)} label`;
				});
			});
		}
	};

	const tippy = initTippy({
		placement: 'bottom-end',
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement | undefined = $state();

	const tippyTooltip = initTooltipTippy();
	$effect(() => {
		if ($map) {
			$map.on('styledata', function () {
				updateLayerOrderList();
			});
			$map.on('sourcedata', function (e) {
				if (e.isSourceLoaded) {
					updateLayerOrderList();
				}
			});
			untrack(() => {
				updateLayerOrderList();
			});
		}
	});
	$effect(() => {
		if ($layerListStore) {
			untrack(() => {
				updateLayerOrderList();
			});
		}
	});
</script>

<button
	class="button m-0 px-4"
	disabled={$layerListStore?.length < 2}
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{ content: 'Change layer order' }}
>
	<span class="icon">
		<span class="material-icons"> low_priority </span>
	</span>
</button>

<div class="tooltip-content" bind:this={tooltipContent}>
	<p class="title is-5 mx-2 mt-0 mb-2 p-0">Layer order settings</p>
	<p class="mx-2 mb-1">Drag and drop to change layer order for rendering in the map.</p>

	<div class="header mx-2 mt-1 mb-2 pb-2">
		<Checkbox label="Show only GeoHub layers" bind:checked={onlyRelative} />
	</div>

	<div class="layer-order">
		<LayerOrderPanel {onlyRendered} {onlyRelative} bind:relativeLayers />
	</div>
</div>

<style lang="scss">
	.header {
		border-bottom: 1px solid gray;
	}

	.layer-order {
		overflow-y: auto;
		max-height: 300px;
	}

	button {
		border: none;
		outline: none;
		appearance: none;
		box-shadow: none;
	}
</style>
