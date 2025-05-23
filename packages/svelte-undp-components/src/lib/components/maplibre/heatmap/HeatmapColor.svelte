<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import chroma from 'chroma-js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import type { RgbaColor } from 'svelte-awesome-color-picker';
	import HeatmapColorRow, {
		type HeatmapColorRow as HeatmapColorRowType
	} from './HeatmapColorRow.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();
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

	let colorValues: HeatmapColorRowType[] = $state([]);
	let heatMapValues =
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : heatMapDefaultValues;

	onMount(() => {
		colorValues = getColorValues();
	});

	const getColorValues = () => {
		const colorRows = heatMapValues.slice(heatMapDataColorIndexStart);
		const colorRowsValues: HeatmapColorRowType[] = [];
		colorRows.map((value: string, index: number) => {
			if (index % 2 === 0) {
				colorRowsValues.push({
					index: index / 2,
					value: typeof value === 'string' ? Number(value) : value,
					color: generateColorObject(colorRows[index + 1]) as RgbaColor
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
			if (!row.color) return;
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

<div class="fixed-grid has-{colorValues.length}-cols">
	<div class="grid is-gap-1">
		{#each colorValues as colorValueRow, index (colorValueRow.index)}
			<div class="cell">
				<HeatmapColorRow
					bind:colorRow={colorValues[index]}
					onchange={handleChangeColorMap}
					readonly={false}
				/>
			</div>
		{/each}
	</div>
</div>
