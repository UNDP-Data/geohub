<script lang="ts">
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		updateParamsInURL
	} from '$lib/helper';
	import {
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		layerList,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);

	export let layerId: string;
	export let colorMapName: string;
	let contentWidth = 280;

	const handleColorMapChanged = () => {
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

		//for rescale the rangeSliderValue sis reactive and also intialized from three locations so this is used to poulate
		// the rescale at all times
		layerURL.searchParams.delete('rescale');

		let updatedParams = { rescale: $rescaleStore.join(','), colormap_name: colorMapName };

		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);

		layerList.setColorMapName(layerId, colorMapName);
	};

	$: $rescaleStore, handleRescaleChanged();
	const handleRescaleChanged = debounce(() => {
		if (!$rescaleStore) return;
		const layerStyle = getLayerStyle($map, layerId);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap');
		updateParamsInURL(
			layerStyle,
			layerURL,
			{ rescale: $rescaleStore.join(','), colormap_name: colorMapName },
			map
		);
	}, 200);
</script>

<div class="is-flex is-flex-direction-column" bind:clientWidth={contentWidth}>
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label has-text-centered">Colormap</label>
		<div class="control">
			<ColorMapPicker
				bind:colorMapName
				on:colorMapChanged={handleColorMapChanged}
				buttonWidth={contentWidth}
			/>
		</div>
	</div>
</div>
