<script lang="ts">
	import RasterPropertyEditor from '$components/maplibre/raster/RasterPropertyEditor.svelte';
	import LegendTypeSwitcher from '$components/pages/map/layers/LegendTypeSwitcher.svelte';
	import RasterBandSelector from '$components/pages/map/layers/raster/RasterBandSelector.svelte';
	import RasterClassifyLegend from '$components/pages/map/layers/raster/RasterClassifyLegend.svelte';
	import RasterDefaultLegend from '$components/pages/map/layers/raster/RasterDefaultLegend.svelte';
	import Help from '$components/util/Help.svelte';
	import { LegendTypes } from '$lib/config/AppConfig';
	import {
		fetchUrl,
		getActiveBandIndex,
		getValueFromRasterTileUrl,
		isRgbRaster,
		loadMap
	} from '$lib/helper';
	import type { BandMetadata, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, layerList, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	export let layer: Layer;

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/**
	 * This component will only decide which legend to show based on the legendType
	 * Initially, the legendType is decided based on if the layer is unique or not
	 * if the layer is unique, the legendType is set to CLASSIFY
	 * if the layer is not unique, the legendType is set to DEFAULT
	 */

	let info: RasterTileMetadata;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	({ info } = layer);

	const isRgbTile = isRgbRaster(info.colorinterp);

	const bandIndex = !isRgbTile ? getActiveBandIndex(info) : -1;
	const bandMetaStats =
		bandIndex > -1 ? (info['band_metadata'][bandIndex][1] as BandMetadata) : undefined;
	let layerHasUniqueValues =
		bandMetaStats &&
		bandMetaStats['STATISTICS_UNIQUE_VALUES'] &&
		Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0;
	export let legendType: LegendTypes;
	let layerStats: RasterLayerStats;

	const setStatsToInfo = async () => {
		// Add "stats" object to the "info" object
		if (!$map.loaded()) {
			console.log('LOADING MAP');
			await loadMap($map);
		}
		if (!info.isMosaicJson) {
			let statsURL = layer.dataset.properties.links.find((l) => l.rel === 'statistics').href;
			layerStats = (await fetchUrl(`${statsURL}&histogram_bins=50`)) as unknown as RasterLayerStats;
			if (layerHasUniqueValues) {
				layerStats = (await fetchUrl(
					`${statsURL}&categorical=true`
				)) as unknown as RasterLayerStats;
			}
			if (!('stats' in info)) {
				info = { ...info, stats: layerStats };
				layer = { ...layer, info: info };
				const layers = $layerList.map((lyr) => {
					return layer.id !== lyr.id ? lyr : layer;
				});
				layerList.set([...layers]);
			}
		}
	};

	const decideLegendType = () => {
		const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap') as number[][][];
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

	const initializeLegend = async () => {
		await loadMap($map);
		if (!isRgbTile) {
			if (!('stats' in layer.info)) await setStatsToInfo();
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
			<RasterPropertyEditor
				bind:layerId={layer.id}
				bind:metadata={layer.info}
				bind:tags={layer.dataset.properties.tags}
			/>
		</div>
		{#if !isRgbTile}
			<RasterBandSelector {layer} />
			{#if !layerHasUniqueValues && legendType === LegendTypes.DEFAULT}
				<div transition:slide|global>
					<RasterDefaultLegend bind:layerId={layer.id} />
				</div>
			{/if}
			{#if legendType === LegendTypes.CLASSIFY}
				<div transition:slide|global>
					<RasterClassifyLegend bind:layer bind:layerHasUniqueValues />
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
