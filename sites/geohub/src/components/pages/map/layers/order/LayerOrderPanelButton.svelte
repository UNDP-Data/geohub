<script lang="ts">
	import LayerOrderPanel from '$components/pages/map/layers/order/LayerOrderPanel.svelte';
	import { clean, initTippy, initTooltipTippy } from '$lib/helper';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { Checkbox } from '@undp-data/svelte-undp-design';
	import type { StyleSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	let onlyRendered = false;
	let onlyRelative = true;
	let relativeLayers: { [key: string]: string } = {};
	let style: StyleSpecification;

	$: if ($map) {
		$map.on('styledata', function () {
			style = $map.getStyle();
			updateLayerOrderList();
		});
		$map.on('sourcedata', function (e) {
			if (e.isSourceLoaded) {
				style = $map.getStyle();
				updateLayerOrderList();
			}
		});
	}

	$: if ($map) {
		updateLayerOrderList();
	}

	$: $layerListStore, updateLayerOrderList();

	const updateLayerOrderList = () => {
		if ($map && $layerListStore) {
			relativeLayers = {};
			$layerListStore.forEach((layer) => {
				relativeLayers[layer.id] = clean(layer.name);

				layer.children?.forEach((child) => {
					relativeLayers[child.id] = `${clean(layer.name)} label`;
				});
			});
			style = $map.getStyle();
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
	let tooltipContent: HTMLElement;

	const tippyTooltip = initTooltipTippy();
</script>

<button
	class="button m-0 px-3"
	disabled={$layerListStore?.length < 2}
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{ content: 'Change layer order' }}
>
	<span class="icon">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
			<mask
				id="mask0_2498_5859"
				style="mask-type:alpha"
				maskUnits="userSpaceOnUse"
				x="0"
				y="0"
				width="24"
				height="25"
			>
				<rect y="0.301025" width="24" height="24" fill="#D9D9D9" />
			</mask>
			<g mask="url(#mask0_2498_5859)">
				<path
					d="M4 11.776C4 12.9594 4.39583 13.976 5.1875 14.826C5.97917 15.676 6.96667 16.151 8.15 16.251L6.6 14.701L8 13.301L12 17.301L8 21.301L6.6 19.901L8.2 18.301C6.45 18.201 4.97917 17.526 3.7875 16.276C2.59583 15.026 2 13.5344 2 11.801C2 9.98436 2.62917 8.44686 3.8875 7.18853C5.14583 5.93019 6.68333 5.30103 8.5 5.30103H12V7.30103H8.5C7.25 7.30103 6.1875 7.73436 5.3125 8.60103C4.4375 9.46769 4 10.526 4 11.776ZM14 18.301V16.301H22V18.301H14ZM14 12.801V10.801H22V12.801H14ZM14 7.30103V5.30103H22V7.30103H14Z"
					fill="#55606E"
				/>
			</g>
		</svg>
	</span>
</button>

<div class="tooltip-content" bind:this={tooltipContent}>
	<p class="title is-5 mx-2 mt-0 mb-2 p-0">Layer order settings</p>
	<p class="mx-2 mb-1">Drag and drop to change layer order for rendering in the map.</p>

	<div class="header mx-2 mt-1 mb-2 pb-2">
		<Checkbox label="Show only GeoHub layers" bind:checked={onlyRelative} />
	</div>

	<div class="layer-order">
		<LayerOrderPanel bind:style bind:onlyRendered bind:onlyRelative bind:relativeLayers />
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

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
	}
</style>
