<script lang="ts">
	import { getActiveBandIndex, getValueFromRasterTileUrl } from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata, Tag } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { createEventDispatcher, getContext } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	let layerMin = NaN;
	let layerMax = NaN;

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

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	// restore rescale values from URL
	if (!$rescaleStore) {
		// default legend uses `rescale` param
		$rescaleStore = getValueFromRasterTileUrl($map, layerId, 'rescale') as number[];

		if (!$rescaleStore) {
			// classify legend uses `colormap` param
			const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
			if (Array.isArray(colormap)) {
				// interval legend
				const first = colormap[0];
				const last = colormap[colormap.length - 1];
				$rescaleStore = [first[0][0], last[0][1]];
			} else {
				// unique value legend or default legend
				$rescaleStore = [layerMin, layerMax];
			}
		}
	}

	let step = ($rescaleStore[1] - $rescaleStore[0]) * 1e-2;

	const onSliderStop = () => {
		// you need to implement actual process of updating legend in the parent component by subscribing the 'change' event.
		// see the detailed implementation at RasterDefaultLgend and RasterClassifyLegend.
		dispatch('change', {
			rescale: $rescaleStore
		});
	};
</script>

<div class="range-slider">
	<RangeSlider
		bind:values={$rescaleStore}
		float
		range
		min={layerMin}
		max={layerMax}
		{step}
		pips
		pipstep={Math.round(step * 10)}
		first="label"
		last="label"
		rest={false}
		on:stop={onSliderStop}
	/>
</div>
{#if unit}
	<p class="align-center"><b>{unit}</b></p>
{/if}

<style lang="scss">
	:global(.rangeNub) {
		cursor: pointer;
	}

	.range-slider {
		position: relative;
		--range-handle-focus: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		--range-range-inactive: #2196f3;
		margin: 0;
	}

	.align-center {
		width: max-content;
		margin: auto;
	}
</style>
