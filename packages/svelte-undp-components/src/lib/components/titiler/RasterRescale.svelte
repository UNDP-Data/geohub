<script lang="ts">
	import Slider from '$lib/components/ui/Slider.svelte';
	import type { BandMetadata, RasterTileMetadata } from '$lib/interfaces/RasterTileMetadata.js';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getActiveBandIndex } from '$lib/util/getActiveBandIndex.js';
	import { getValueFromRasterTileUrl } from '$lib/util/getValueFromRasterTileUrl.js';
	import { isInt } from '$lib/util/isInt.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: RasterTileMetadata;
		unit?: string;
		rescale: number[];
		onchange?: (rescale: number[]) => void;
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		unit = $bindable(''),
		rescale = $bindable(),
		onchange = () => {}
	}: Props = $props();

	let layerMin = $state(NaN);
	let layerMax = $state(NaN);

	let step = $state(1);

	onMount(() => {
		if ('stats' in metadata) {
			const band = metadata.active_band_no;
			layerMin = Number(metadata.stats[band].min);
			layerMax = Number(metadata.stats[band].max);
		} else {
			const bandIndex = getActiveBandIndex(metadata);
			const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
			layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
			layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
		}

		// restore rescale values from URL
		if (!rescale) {
			// default legend uses `rescale` param
			rescale = getValueFromRasterTileUrl($map, layerId, 'rescale') as number[];

			if (!rescale) {
				// classify legend uses `colormap` param
				const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
				if (Array.isArray(colormap)) {
					// interval legend
					const first = colormap[0];
					const last = colormap[colormap.length - 1];
					rescale = [first[0][0], last[0][1]];
				} else {
					// unique value legend or default legend
					rescale = [layerMin, layerMax];
				}
			}
		}

		// if min and max are integer, set step to 1, otherwise use 0.1 for step.
		// but use 0.1 step if the difference of min and max is less than 1
		step = isInt(layerMin) && isInt(layerMax) && layerMax - layerMin > 1 ? 1 : 0.1;
	});

	const onSliderStop = (values: number[]) => {
		rescale = [...values];
		// you need to implement actual process of updating legend in the parent component by subscribing the 'change' event.
		// see the detailed implementation at RasterDefaultLgend and RasterClassifyLegend.
		if (onchange) onchange(rescale);
	};
</script>

{#if rescale && rescale.length > 0}
	<Slider
		bind:values={rescale}
		min={layerMin}
		max={layerMax}
		{step}
		pips
		first="label"
		last="label"
		rest={false}
		onchange={onSliderStop}
		showEditor={true}
	/>
{/if}
{#if unit}
	<p class="align-center"><b>{unit}</b></p>
{/if}

<style lang="scss">
	:global(.rangeNub) {
		cursor: pointer;
	}

	.align-center {
		width: max-content;
		margin: auto;
	}
</style>
