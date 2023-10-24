<script lang="ts">
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import {
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		updateParamsInURL
	} from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layerId: string;
	export let colorMapName: string;
	export let metadata: RasterTileMetadata;

	export let contentWidth: number;

	let layerMin: number;
	let layerMax: number;

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

	// the reactive statement below will update map whenever the colormap changes or the legend was switched.
	// quite a tricky business
	// as the colorMapName is two way binded, this means next fucntion is loaded all the time
	// for this reason it makes a lot of sense to consider it a workhorse and do a lot of sanitation ans well

	$: colorMapName, colorMapNameChanged();
	const colorMapNameChanged = () => {
		const currCMAP = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;

		// invalid cases
		if (!colorMapName || currCMAP == colorMapName) {
			return;
		}

		const layerUrl = getLayerSourceUrl($map, layerId) as string;
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

		let rescale = getValueFromRasterTileUrl($map, layerId, 'rescale') as number[];
		if (!rescale) {
			rescale = [layerMin, layerMax];
		}
		updatedParams = Object.assign(updatedParams, { rescale: rescale.join(',') });

		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);
		dispatch('change', {
			layerId,
			colorMapName
		});
	};
</script>

<div class="field">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="label has-text-centered">Colormap</label>
	<div class="control">
		<ColorMapPicker
			bind:colorMapName
			on:colorMapChanged={colorMapNameChanged}
			buttonWidth={contentWidth}
		/>
	</div>
</div>
