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
	import type { BandMetadata, Layer, RasterTileMetadata } from '$lib/types';
	import { layerList, map } from '$stores';
	import RangeSlider from 'svelte-range-slider-pips';
	import ColorMapPicker from './ColorMapPicker.svelte';

	export let layerConfig: Layer;
	let colorMapName = layerConfig.colorMapName;

	let info: RasterTileMetadata;
	({ info } = layerConfig);

	let contentWidth = 300;
	let layerMin = NaN;
	let layerMax = NaN;

	const bandIndex = getActiveBandIndex(info);
	const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata;

	if ('stats' in info) {
		const band = Object.keys(info.stats)[bandIndex];
		layerMin = Number(info.stats[band].min);
		layerMax = Number(info.stats[band].max);
	} else {
		layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
		layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	}

	const tags = layerConfig.dataset.properties.tags;
	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const rescale = getValueFromRasterTileUrl($map, layerConfig.id, 'rescale') as number[];

	// this ensures the slider state is set to 1) rescale from url, 2 rescale state, 3 layermin/max
	let rangeSliderValues = rescale
		? rescale
		: rclState['rescale']
		? rclState['rescale']
		: ([layerMin, layerMax] as number[]);

	let step = (layerMax - layerMin) * 1e-2;

	// the reactive statement below will update map whenever the colormap changes or the legend was switched.
	// quite a tricky business
	// as the colorMapName is two way binded, this means next fucntion is loaded all the time
	// for this reason it makes a lot of sense to consider it a workhorse and do a lot of sanitation ans well

	$: colorMapName, colorMapNameChanged();
	const colorMapNameChanged = () => {
		const currCMAP = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap_name') as string;

		// invalid cases
		if (!colorMapName || currCMAP == colorMapName) {
			return;
		}

		const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string;
		if (!(layerUrl && layerUrl.length > 0)) {
			return;
		}

		const layerURL = new URL(layerUrl);
		// remove colormap in case the layer was previously in
		if (layerURL.searchParams.has('colormap')) layerURL.searchParams.delete('colormap');

		// set color map and force map rerender
		layerURL.searchParams.delete('colormap_name');
		let updatedParams = Object.assign({ colormap_name: colorMapName });

		//for rescale the rangeSliderValue sis reactive and also intialized from three locations so this is used to poulate
		// the rescale at all times
		layerURL.searchParams.delete('rescale');
		updatedParams = Object.assign(updatedParams, { rescale: rangeSliderValues.join(',') });

		const layerStyle = getLayerStyle($map, layerConfig.id);
		updateParamsInURL(layerStyle, layerURL, updatedParams);
		layerList.setColorMapName(layerConfig.id, colorMapName);
	};

	const onSliderStop = () => {
		const layerStyle = getLayerStyle($map, layerConfig.id);
		const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		updateParamsInURL(layerStyle, layerURL, { rescale: rangeSliderValues.join(',') });
		rclState['rescale'] = rangeSliderValues;
	};
</script>

<div class="columns is-mobile" bind:clientWidth={contentWidth}>
	<div class="column">
		<div class="group" data-testid="continuous-view-container">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label has-text-centered">Colormap</label>
				<div class="control">
					<div class="colormap-picker">
						<ColorMapPicker
							bind:colorMapName
							on:colorMapChanged={colorMapNameChanged}
							buttonWidth={contentWidth - 30}
						/>
					</div>
				</div>
			</div>

			<div class="range-slider pt-5 px-2">
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

				{#if unit}
					<p class="align-center"><b>{unit}</b></p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	:global(.rangeNub) {
		cursor: pointer;
	}

	.group {
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
	}
</style>
