<script lang="ts">
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import { convertFunctionToExpression, getLayerStyle } from '$lib/helper';
	import type { ColorMapRow, VectorTileMetadata } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type MapStore,
		type SpriteImageStore
	} from '$stores';
	import { clean, isInt } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let propertyName:
		| 'fill-extrusion-color'
		| 'fill-color'
		| 'line-color'
		| 'icon-color'
		| 'circle-color'
		| 'text-color';
	export let transparentColor = [255, 255, 255, 0];

	let isUniqueValue = false;
	let colormapStyle = '';

	const getColor = (): string | string[] => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
			color = '#00000';
		}
		color = convertFunctionToExpression(color, chroma(transparentColor).hex());
		return color as string | string[];
	};

	let value = getColor();
	let propertySelectValue = Array.isArray(value) ? value[1][1] : '';

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	const restoreColorMapRows = () => {
		let rows = [];
		const values = value as string[];
		if (values[0] === 'match') {
			// unique value
			isUniqueValue = true;
			for (let i = 2; i < values.length; i = i + 2) {
				const isLast = i === values.length - 1;
				const attrValue = isLast ? undefined : values[i];
				const color = isLast ? chroma(values[i]).rgba() : chroma(values[i + 1]).rgba();
				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: attrValue,
					end: attrValue
				};
				rows.push(row);
			}
		} else if (value[0] === 'step') {
			// interval
			const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);
			for (let i = 2; i < values.length; i = i + 2) {
				const color = chroma(values[i]).rgba();
				const attrValue = values[i + 1];

				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: rows.length === 0 ? attribute.min.toFixed(1) : rows[rows.length - 1].end,
					end: attrValue ?? attribute.max.toFixed(2)
				};
				rows.push(row);
			}
		}

		return rows;
	};

	let colorMapRows: ColorMapRow[] = [];

	const generateColormapStyle = () => {
		let colors: string[];
		colors = colorMapRows.map((r) =>
			chroma.rgb(r.color[0], r.color[1], r.color[2], r.color[3]).css()
		);
		const color = chroma.scale(colors).mode('lrgb').colors(colorMapRows.length, 'rgba');
		let style = `height: calc(1px * 28); width: 100%; background: linear-gradient(90deg, ${color});`;
		return style;
	};

	const formatNumber = (value: string | number, decimalPosition = 2) => {
		let target: number;
		if (typeof value === 'string') {
			target = parseFloat(value);
		} else {
			target = value;
		}

		if (isInt(target)) {
			return target;
		} else {
			return target.toFixed(decimalPosition);
		}
	};

	const getLineWidth = () => {
		let width = $map.getPaintProperty(layerId, 'line-width') as number;
		if (!width) {
			width = 1;
		}
		return width;
	};

	const getCircleRadius = () => {
		let radius = $map.getPaintProperty(layerId, 'circle-radius') as number;
		if (!radius) {
			radius = 5;
		}
		return radius;
	};

	const getCircleStrokeColor = () => {
		let color = $map.getPaintProperty(layerId, 'circle-stroke-color') as string;
		if (!color) {
			color = '#000000';
		}
		return color;
	};

	const getCircleStrokeWidth = () => {
		let width = $map.getPaintProperty(layerId, 'circle-stroke-width') as number;
		if (!(width && typeof width === 'number')) {
			width = 0;
		}
		return width;
	};

	const getIconImage = (color: string) => {
		let image = $map.getLayoutProperty(layerId, 'icon-image') as string;
		if (!(image && typeof image === 'string')) {
			image = undefined;
		}

		if (image) {
			const icon = $spriteImageList.find((icon) => icon.alt === image);
			if (icon) {
				const rgba = chroma(color).rgba();
				const cssFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex());
				const iconImageStyle = `filter: ${cssFilter?.filter}`;
				return {
					src: icon.src,
					alt: icon.alt,
					style: iconImageStyle
				};
			}
		}

		return;
	};

	onMount(() => {
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
		colormapStyle = generateColormapStyle();
	});
</script>

{#if isUniqueValue}
	<table class="color-table table is-striped is-narrow is-hoverable is-fullwidth">
		<thead>
			<tr>
				<th style="min-width: 100px;">Appearance</th>
				<th class="is-capitalized" style="width: 100%;">
					{clean(propertySelectValue)}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each colorMapRows as colorMapRow}
				{@const rgba = chroma(
					colorMapRow.color[0],
					colorMapRow.color[1],
					colorMapRow.color[2],
					colorMapRow.color[3]
				).css()}
				<tr>
					<td style="min-width: 100px;">
						{#if propertyName === 'line-color'}
							{@const lineWidth = getLineWidth()}

							<svg height="24" width="100px">
								<line
									x1="0"
									y1="10"
									x2="100"
									y2="10"
									style="stroke:{rgba};stroke-width:{lineWidth}"
								/>
							</svg>
						{:else if propertyName === 'icon-color'}
							{@const icon = getIconImage(rgba)}
							<figure class={`image is-24x24`} data-testid="icon-figure">
								<img src={icon.src} alt={icon.alt} style={icon.style} />
							</figure>
						{:else if propertyName === 'circle-color'}
							{@const radius = getCircleRadius()}
							{@const strokeColor = getCircleStrokeColor()}
							{@const strokeWidth = getCircleStrokeWidth()}
							<svg height="24" width="24">
								<circle
									cx="12"
									cy="12"
									r={radius}
									stroke={strokeColor}
									stroke-width={strokeWidth}
									fill={rgba}
								/>
							</svg>
						{:else}
							<div style="background-color: {rgba}; min-width: 100px; height: 24px;"></div>
						{/if}
					</td>

					<td style="width: 100%;">
						<span class="label-value">{colorMapRow.start ?? 'Other'}</span></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
{:else if colorMapRows?.length > 0 && colormapStyle}
	{@const first = colorMapRows[0].start}
	{@const end = colorMapRows[colorMapRows.length - 1].end}
	{@const layerStyle = getLayerStyle($map, layerId)}
	<div style="width: 100%">
		<span class="is-capitalized is-size-6">
			{clean(propertySelectValue)}
		</span>

		<div style={colormapStyle} />

		<div class="is-flex">
			<span class="is-size-6">{formatNumber(first)}</span>
			<span class="unit align-center is-flex">
				{#if ['symbol', 'line', 'circle'].includes(layerStyle.type)}
					<span class="pr-1">
						<Legend layer={layerStyle} />
					</span>
				{/if}
			</span>
			<span class="align-right is-size-6">{formatNumber(end)}</span>
		</div>
	</div>
{/if}

<style lang="scss">
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
</style>
