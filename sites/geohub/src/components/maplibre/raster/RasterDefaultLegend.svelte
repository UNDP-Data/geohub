<script lang="ts">
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		updateParamsInURL
	} from '$lib/helper';
	import type { Tag } from '$lib/types';
	import {
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ColorMapNameStore,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let tags: Tag[] = [];
	let contentWidth = 280;

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const handleColorMapChanged = () => {
		const currCMAP = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;

		// invalid cases
		if (!$colorMapNameStore || currCMAP == $colorMapNameStore) {
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

		let updatedParams = { rescale: $rescaleStore.join(','), colormap_name: $colorMapNameStore };

		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);
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
			{ rescale: $rescaleStore.join(','), colormap_name: $colorMapNameStore },
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
				bind:colorMapName={$colorMapNameStore}
				on:colorMapChanged={handleColorMapChanged}
			/>
			{#if $rescaleStore?.length > 1}
				<div class="is-flex">
					<span class="has-text-weight-bold is-size-6">{$rescaleStore[0]}</span>
					{#if unit}
						<span class="align-center has-text-weight-bold is-size-5">{unit}</span>
					{/if}
					<span class="align-right has-text-weight-bold is-size-6">{$rescaleStore[1]}</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.align-center {
		margin-left: auto;
		margin-right: 0;
	}
	.align-right {
		margin-left: auto;
	}
</style>
