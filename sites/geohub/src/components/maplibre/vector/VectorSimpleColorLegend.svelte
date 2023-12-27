<script lang="ts">
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import { clean, convertFunctionToExpression, getLayerStyle, isInt } from '$lib/helper';
	import type { ColorMapRow, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import chroma from 'chroma-js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

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
		const color = chroma
			.scale(colors)
			.mode('lrgb')
			.padding([0.25, 0])
			.domain([1, 100])
			.colors(colorMapRows.length, 'rgba');
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

	onMount(() => {
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
		colormapStyle = generateColormapStyle();
		console.log(colorMapRows);
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
					<td style="background-color: {rgba}; min-width: 100px;"></td>

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
		<div style={colormapStyle} />

		<div class="is-flex">
			<span class="has-text-weight-semibold is-size-6">{formatNumber(first)}</span>
			<span class="unit align-center is-flex">
				{#if ['symbol', 'line', 'circle'].includes(layerStyle.type)}
					<span class="pr-1">
						<Legend layer={layerStyle} />
					</span>
				{/if}
				<span class="has-text-weight-semibold is-capitalized is-size-5">
					{clean(propertySelectValue)}
				</span>
			</span>
			<span class="align-right has-text-weight-semibold is-size-6">{formatNumber(end)}</span>
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
