<script lang="ts">
	import {
		getActiveBandIndex,
		getValueFromRasterTileUrl,
		isRgbRaster,
		isUniqueValueRaster
	} from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import chroma from 'chroma-js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	// const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);

	let colormapStyle = '';
	let rescaleValueForLabel: number[] = [];
	let uniqueValueColors: { [key: string]: number[] } = {};
	let uniqueValueLabels: { [key: string]: string } = {};

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const getRescale = () => {
		const bandIndex = getActiveBandIndex(metadata);
		const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;

		if (layerHasUniqueValues) {
			uniqueValueLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES'] as { [key: string]: string };
			if (typeof uniqueValueLabels === 'string') {
				uniqueValueLabels = JSON.parse(uniqueValueLabels);
			}
		}

		let layerMin: number;
		let layerMax: number;

		if ('stats' in metadata) {
			const band = Object.keys(metadata.stats)[bandIndex];
			layerMin = Number(metadata.stats[band].min);
			layerMax = Number(metadata.stats[band].max);
		} else {
			layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
			layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
		}

		const rescale = getValueFromRasterTileUrl($map, layerId, 'rescale') as number[];
		if (rescale) {
			return rescale;
		} else {
			const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
			if (Array.isArray(colormap)) {
				if (!(rescaleValueForLabel?.length > 0)) {
					const values = colormap.map((c) => c[0]);
					return [values[0][0], values[values.length - 1][1]];
				}
			}
			return [layerMin, layerMax];
		}
	};

	const generateColormapLegend = () => {
		const colormap_name = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];

		if (colormap_name) {
			const isReverse = colormap_name.indexOf('_r') !== -1;
			let color = chroma
				.scale(colormap_name.replace('_r', ''))
				.mode('lrgb')
				.padding([0.25, 0])
				.domain([1, 100])
				.colors(5, 'rgba');
			if (isReverse) {
				color = color.reverse();
			}
			colormapStyle = `height: calc(1px * 28); width: width: 100%; background: linear-gradient(90deg, ${color});`;
		} else if (colormap) {
			let colors: string[];
			if (Array.isArray(colormap)) {
				colors = colormap.map((c) => chroma.rgb(c[1][0], c[1][1], c[1][2]).css());
			} else {
				uniqueValueColors = colormap as { [key: string]: number[] };
				colors = Object.values(colormap).map((c) => chroma.rgb(c[0], c[1], c[2]).css());
			}
			const color = chroma
				.scale(colors)
				.mode('lrgb')
				.padding([0.25, 0])
				.domain([1, 100])
				.colors(colormap.length, 'rgba');
			colormapStyle = `height: calc(1px * 28); width: 100%; background: linear-gradient(90deg, ${color});`;
		}
	};

	onMount(() => {
		generateColormapLegend();
		rescaleValueForLabel = getRescale();
	});
</script>

{#if !layerHasUniqueValues}
	<p style="width: 100%">
		{#if colormapStyle}
			<div style={colormapStyle} />
		{/if}

		{#if rescaleValueForLabel?.length > 1}
			<div class="is-flex">
				<span class="has-text-weight-bold is-size-6">{rescaleValueForLabel[0].toFixed(2)}</span>
				{#if unit}
					<span class="unit align-center has-text-weight-bold is-size-5">{unit}</span>
				{/if}
				<span class="align-right has-text-weight-bold is-size-6"
					>{rescaleValueForLabel[1].toFixed(2)}</span
				>
			</div>
		{/if}
	</p>
{:else}
	<table class="color-table table is-striped is-narrow is-hoverable is-fullwidth">
		<thead>
			<tr>
				<th style="min-width: 100px;">Appearance</th>
				<th style="width: 100%;"> Value </th>
			</tr>
		</thead>
		<tbody>
			{#each Object.keys(uniqueValueColors) as key}
				{@const item = uniqueValueColors[key]}
				{@const color = chroma.rgb(item[0], item[1], item[2], item[3]).css()}

				<tr>
					<td style="background-color: {color}; min-width: 100px;"></td>
					<td style="width: 100%;">
						<span class="label-value">
							{#if uniqueValueLabels && uniqueValueLabels[key]}
								{uniqueValueLabels[key]}
							{:else}
								{key}
							{/if}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style lang="scss">
	.align-center {
		margin-left: auto;
		margin-right: 0;
	}
	.align-right {
		margin-left: auto;
	}

	.unit {
		max-width: 100px;
	}

	.color-table {
		thead,
		tbody {
			display: block;
		}
		tbody {
			overflow-x: hidden;
			overflow-y: scroll;
			max-height: 200px;
		}
	}

	.label-value {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
	}
</style>
