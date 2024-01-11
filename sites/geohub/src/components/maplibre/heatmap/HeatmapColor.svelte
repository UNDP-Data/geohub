<script lang="ts">
	import HeatmapColorRow from '$components/maplibre/heatmap/HeatmapColorRow.svelte';
	import type { Color } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import chroma from 'chroma-js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	export let layerId: string;
	const propertyName = 'heatmap-color';
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];
	const heatMapDataColorIndexStart = 3;
	const heatMapDefaultValues = [
		'interpolate',
		['linear'],
		['heatmap-density'],
		0,
		'rgba(0, 0, 255, 0)',
		0.1,
		'rgb(0,0,255)',
		0.3,
		'rgb(0,255,255)',
		0.5,
		'rgb(0,255,0)',
		0.7,
		'rgb(255,255,0)',
		1,
		'rgb(255,0,0)'
	];

	let colorValues = [];
	let heatMapValues =
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : heatMapDefaultValues;

	let simpleLegendStyle = '';

	onMount(() => {
		colorValues = getColorValues();

		const color: string[] = $map.getPaintProperty(layerId, 'heatmap-color') as string[];
		if (color && color[0] === 'interpolate') {
			const colors: string[] = [];
			for (let i = 4; i < color.length; i = i + 2) {
				colors.push(color[i]);
			}
			const colormap = chroma
				.scale(colors)
				.mode('lrgb')
				.padding([0.25, 0])
				.domain([1, 100])
				.colors(colors.length, 'rgba');
			const cssStyle = `height: calc(1px * 28); width: 100%; background: linear-gradient(90deg, ${colormap});`;
			simpleLegendStyle = cssStyle;
		}
	});

	const getColorValues = () => {
		const colorRows = heatMapValues.slice(heatMapDataColorIndexStart);
		const colorRowsValues = [];
		colorRows.map((value: string, index: number) => {
			if (index % 2 === 0) {
				colorRowsValues.push({
					index: index / 2,
					value,
					color: generateColorObject(colorRows[index + 1]) as Color
				});
			}
		});

		return colorRowsValues;
	};

	const generateColorObject = (rgbColor: string) => {
		let String = rgbColor.replace('rgba(', '').replace('rgb(', '').replace(')', '');
		let rgbArray = String.split(',');
		let r = parseInt(rgbArray[0]);
		let g = parseInt(rgbArray[1]);
		let b = parseInt(rgbArray[2]);
		let a = 1;
		return {
			r,
			g,
			b,
			a,
			hex: chroma([r, g, b]).hex('rgb'),
			h: chroma([r, g, b]).hsv()[0],
			s: chroma([r, g, b]).hsv()[1],
			v: chroma([r, g, b]).hsv()[2]
		};
	};

	const handleChangeColorMap = () => {
		if (style.type !== 'heatmap') return;
		colorValues.forEach((row) => {
			let colorValue = `rgb(${row.color.r},${row.color.g},${row.color.b})`;
			if (row.index === 0 || row.color.a < 255) {
				colorValue = `rgba(${row.color.r}, ${row.color.g}, ${row.color.b}, ${
					row.index === 0 ? 0 : row.color.a
				})`;
			}
			heatMapValues[row.index * 2 + heatMapDataColorIndexStart + 1] = colorValue;
		});
		map.setPaintProperty(layerId, propertyName, heatMapValues);
	};
</script>

{#if !$legendReadonly}
	<div class="grid">
		{#each colorValues as colorValueRow}
			<HeatmapColorRow
				bind:colorRow={colorValueRow}
				on:changeColorMap={handleChangeColorMap}
				bind:readonly={$legendReadonly}
			/>
		{/each}
	</div>
{:else if simpleLegendStyle}
	<div class="is-flex is-flex-direction-column">
		<div style={simpleLegendStyle} />
		<div class="is-flex has-text-weight-semibold">
			<span>Low</span>
			<span class="align-right">High</span>
		</div>
	</div>
{/if}

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.2rem;
	}

	.align-right {
		margin-left: auto;
	}
</style>
