<script lang="ts">
	import RasterClassifyLegend from '$components/maplibre/raster/RasterClassifyLegend.svelte';
	import RasterDefaultLegend from '$components/maplibre/raster/RasterDefaultLegend.svelte';
	import RasterPropertyEditor from '$components/maplibre/raster/RasterPropertyEditor.svelte';
	import LegendTypeSwitcher from '$components/pages/map/layers/LegendTypeSwitcher.svelte';
	import Help from '$components/util/Help.svelte';
	import { LegendTypes } from '$lib/config/AppConfig';
	import {
		getValueFromRasterTileUrl,
		isRgbRaster,
		isUniqueValueRaster,
		loadMap
	} from '$lib/helper';
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let tags: Tag[];
	export let metadata: RasterTileMetadata;
	let legendType: LegendTypes;

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);

	const decideLegendType = () => {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		// maintains the state of the legendType
		if (!legendType) {
			if (colormap || layerHasUniqueValues) {
				legendType = LegendTypes.CLASSIFY;
			} else {
				legendType = LegendTypes.DEFAULT;
			}
			return legendType;
		}
	};

	/**
	 * This component will only decide which legend to show based on the legendType
	 * Initially, the legendType is decided based on if the layer is unique or not
	 * if the layer is unique, the legendType is set to CLASSIFY
	 * if the layer is not unique, the legendType is set to DEFAULT
	 */
	const initializeLegend = async () => {
		await loadMap($map);
		if (!isRgbTile) {
			if (!legendType) decideLegendType();
		}
		return legendType;
	};
</script>

<div class="legend-container">
	{#await initializeLegend()}
		<div class="loader-container p-3">
			<Loader size="small" />
		</div>
	{:then}
		{#if !isRgbTile}
			{#if !layerHasUniqueValues}
				<LegendTypeSwitcher bind:legendType />
			{/if}
			<div class="help">
				<Help>
					<p class="has-text-justified">
						Enhance your raster visualization using the following tips.
					</p>
					<p>
						The <b>Default</b> legend provides you simple continuous rendering by selected colormap and
						minimum/maximum
					</p>
					<p>
						The <b>Classify</b> legend provides you more functionality to visualise the data by
						either interval legend or unique value legend. You can increase or reduce
						<b>number of classes</b>, or change classificaiton method to visualise it. The color for
						each class can also be changed by clicking <b>color</b> button, or it can be hiden by
						clicking <b>eye</b> button.
					</p>
					<p>
						Change the visualization colormap by clicking the <b>Colormap</b> button and selecting another
						colormap
					</p>
				</Help>
			</div>
		{/if}
		{#if isRgbTile}
			<p style="max-width: 250px;">Adjust parameters to render from the button.</p>
		{/if}
		<div class="editor-button">
			<RasterPropertyEditor bind:layerId bind:metadata bind:tags />
		</div>
		{#if !isRgbTile}
			{#if !layerHasUniqueValues && legendType === LegendTypes.DEFAULT}
				<div transition:slide|global>
					<RasterDefaultLegend bind:layerId bind:tags />
				</div>
			{/if}
			{#if legendType === LegendTypes.CLASSIFY}
				<div transition:slide|global>
					<RasterClassifyLegend bind:layerId bind:metadata />
				</div>
			{/if}
		{/if}
	{/await}
</div>

<style lang="scss">
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}

	.legend-container {
		position: relative;
		min-height: 40px;

		.help {
			position: absolute;
			top: 0em;
			left: 0em;
			z-index: 10;
		}

		.editor-button {
			position: absolute;
			top: 0em;
			right: 0em;
			z-index: 10;
		}
	}
</style>
