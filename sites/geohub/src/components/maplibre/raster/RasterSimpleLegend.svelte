<script lang="ts">
	import {
		getActiveBandIndex,
		getValueFromRasterTileUrl,
		isRgbRaster,
		isUniqueValueRaster,
		loadMap
	} from '$lib/helper';
	import type { BandMetadata, Link, RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	// const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];
	export let links: Link[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);

	let colormapStyle = '';
	let rescaleValueForLabel: number[] = [];
	let uniqueValueColors: { [key: string]: number[] } = {};
	let uniqueValueLabels: { [key: string]: string } = {};

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const getRescale = () => {
		const bandIndex = getActiveBandIndex(metadata);
		if (metadata['band_metadata'][bandIndex]) {
			const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;

			if (layerHasUniqueValues) {
				uniqueValueLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES'] as { [key: string]: string };
				if (typeof uniqueValueLabels === 'string') {
					uniqueValueLabels = JSON.parse(uniqueValueLabels);
				}
			}
		}

		let layerMin: number;
		let layerMax: number;

		if ('stats' in metadata) {
			const band = metadata.active_band_no;
			layerMin = Number(metadata.stats[band].min);
			layerMax = Number(metadata.stats[band].max);
		} else {
			const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
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

	const hasColormap = () => {
		const colormap_name = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		return colormap_name || colormap;
	};

	const generateColormapLegend = () => {
		const colormap_name = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];

		if (colormap_name) {
			const isReverse = colormap_name.indexOf('_r') !== -1;
			let color = chroma.scale(colormap_name.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
			if (isReverse) {
				color = color.reverse();
			}
			colormapStyle = `height: calc(1px * 28); width: width: 100%; background: linear-gradient(90deg, ${color});`;
		} else if (colormap) {
			let colors: string[];
			if (Array.isArray(colormap)) {
				colors = colormap.map((c) => chroma.rgb(c[1][0], c[1][1], c[1][2], c[1][3]).css());
			} else {
				uniqueValueColors = colormap as { [key: string]: number[] };
				colors = Object.values(colormap).map((c) => chroma.rgb(c[0], c[1], c[2], c[3]).css());
			}
			const color = chroma.scale(colors).mode('lrgb').colors(colormap.length, 'rgba');
			colormapStyle = `height: calc(1px * 28); width: 100%; background: linear-gradient(90deg, ${color});`;
		}
	};

	let algorithmId = '';
	let isInitialised = false;

	onMount(() => {
		$map.on('styledata', updateLegend);

		loadMap($map).then(() => {
			algorithmId = getValueFromRasterTileUrl($map, layerId, 'algorithm') as string;

			generateColormapLegend();
			rescaleValueForLabel = getRescale();
			isInitialised = true;
		});
	});

	const getPreviewUrl = (width: number, height: number) => {
		if (!$map.getLayer(layerId)) return;
		let titilerBaseUrl = links.find((l) => l.rel === 'cog')?.href;
		if (!titilerBaseUrl) return;

		const infoUrl = links.find((l) => l.rel === 'info')?.href;
		if (!infoUrl) return;
		const fileUrl = new URL(infoUrl).searchParams.get('url');

		if (!(algorithmId || (!algorithmId && isRgbTile))) return;

		const previewUrl = new URL(`${titilerBaseUrl}/preview`);
		previewUrl.searchParams.set('url', fileUrl);
		if (algorithmId) {
			previewUrl.searchParams.set('algorithm', algorithmId);
		}
		const params = (getValueFromRasterTileUrl($map, layerId, 'algorithm_params') as string) ?? '';
		if (params.length > 0) {
			previewUrl.searchParams.set('algorithm_params', params);
		}
		const bidx = (getValueFromRasterTileUrl($map, layerId, 'bidx') as string) ?? undefined;
		if (bidx) {
			previewUrl.searchParams.set('bidx', bidx);
		}
		previewUrl.searchParams.set('height', `${height}`);
		previewUrl.searchParams.set('width', `${width}`);
		return previewUrl.href;
	};

	const getHillshadeColor = () => {
		return $map.getPaintProperty(layerId, 'hillshade-accent-color') as string;
	};
	const getHillshadeShadowColor = () => {
		return $map.getPaintProperty(layerId, 'hillshade-shadow-color') as string;
	};

	let isLayerChanged = false;
	const updateLegend = debounce((e) => {
		if (e.layerId && layerId !== e.layerId) return;
		isLayerChanged = !isLayerChanged;
	}, 300);
</script>

{#if isInitialised}
	{#if !algorithmId || hasColormap()}
		{#if !layerHasUniqueValues}
			<p style="width: 100%">
				{#if isRgbTile}
					{@const previewUrl = getPreviewUrl(64, 64)}
					{#key isLayerChanged}
						{#if previewUrl}
							<figure class="image is-64x64">
								<img src={previewUrl} alt={algorithmId} width="64" height="64" />
							</figure>
						{:else}
							<span>True color raster</span>
						{/if}
					{/key}
				{:else}
					{#if unit}
						<span class="unit is-size-6">{unit}</span>
					{/if}

					{#if colormapStyle}
						<div style={colormapStyle} />
					{/if}

					{#if rescaleValueForLabel?.length > 1}
						<div class="is-flex">
							<span class="is-size-6">{rescaleValueForLabel[0].toFixed(2)}</span>
							<span class="align-right is-size-6">{rescaleValueForLabel[1].toFixed(2)}</span>
						</div>
					{/if}
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
	{:else}
		{@const layerStyle = $map.getStyle().layers.find((l) => l.id === layerId)}
		{#if layerStyle}
			{#if layerStyle.type === 'hillshade'}
				{@const accentColor = getHillshadeColor()}
				{@const shadowColor = getHillshadeShadowColor()}
				<div class="is-flex is-align-items-center">
					<span class="icon is-normal">
						<i
							class="fa-solid fa-wave-square fa-xl"
							style="color: {accentColor}; text-shadow: 2px 2px {shadowColor};"
						></i>
					</span>
					<span class="ml-3 is-size-6">Hillshade</span>
				</div>
			{:else}
				{@const previewUrl = getPreviewUrl(64, 64)}
				{#key isLayerChanged}
					{#if previewUrl}
						<figure class="image is-64x64">
							<img src={previewUrl} alt={algorithmId} width="64" height="64" />
						</figure>
					{:else}
						<span>No preview is available</span>
					{/if}
				{/key}
			{/if}
		{/if}
	{/if}
{:else}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{/if}

<style lang="scss">
	.align-right {
		margin-left: auto;
	}

	.unit {
		width: 100%;
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
