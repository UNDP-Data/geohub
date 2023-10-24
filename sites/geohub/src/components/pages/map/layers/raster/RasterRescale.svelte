<script lang="ts" context="module">
	let rclState = {};
</script>

<script lang="ts">
	import {
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		updateParamsInURL
	} from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	let layerMin = NaN;
	let layerMax = NaN;

	const bandIndex = getActiveBandIndex(metadata);
	const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;

	if ('stats' in metadata) {
		const band = Object.keys(metadata.stats)[bandIndex];
		layerMin = Number(metadata.stats[band].min);
		layerMax = Number(metadata.stats[band].max);
	} else {
		layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
		layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	}

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const rescale = getValueFromRasterTileUrl($map, layerId, 'rescale') as number[];

	// this ensures the slider state is set to 1) rescale from url, 2 rescale state, 3 layermin/max
	let rangeSliderValues = rescale
		? rescale
		: rclState['rescale']
		? rclState['rescale']
		: ([layerMin, layerMax] as number[]);

	let step = (layerMax - layerMin) * 1e-2;

	const onSliderStop = () => {
		const layerStyle = getLayerStyle($map, layerId);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		updateParamsInURL(layerStyle, layerURL, { rescale: rangeSliderValues.join(',') }, map);
		rclState['rescale'] = rangeSliderValues;
	};
</script>

<div class="range-slider">
	<RangeSlider
		bind:values={rangeSliderValues}
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
