<script lang="ts">
	import { type VisualizationSpec, VegaLite } from 'svelte-vega';
	import { onMount } from 'svelte';
	import { fetchUrl } from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';

	export let layer: Layer;

	let info;
	({ info } = layer);

	const table = [];
	let data;

	onMount(async () => {
		const rasterInfo = layer.info as RasterTileMetadata;
		if (!rasterInfo?.isMosaicJson) {
			const statsURL = layer.dataset.properties.links.find((l) => l.rel === 'statistics').href;
			let layerStats;
			layerStats = await fetchUrl(statsURL);
			info.stats = layerStats;
		}
		const band = info.active_band_no;
		const counts = info.stats[band]['histogram'][0];
		const sum = counts.reduce((a, b) => a + b, 0);
		const probability = counts.map((item) => item / sum);
		const interval = info.stats[band]['histogram'][1];

		if (!rasterInfo?.isMosaicJson) {
			for (let i = 0; i < interval.length - 1; i++) {
				interval[i] = (interval[i] + interval[i + 1]) * 0.5;
			}
		}

		counts.unshift(0);
		counts.push(0);
		if (probability[0] > 0) {
			probability.unshift(0);
		}
		if (probability[probability.length - 1] < 1) {
			probability.push(0);
		}

		interval.slice(1).map((item, index) => {
			table.push({
				interval: Number(item.toFixed(2)),
				probability: Number(probability[index].toFixed(2)),
				counts: Number(counts[index].toFixed(2))
			});
		});

		data = { table: table };
	});

	let viewVL;
	let specVL: VisualizationSpec = {
		$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
		padding: 0,
		width: 200,
		height: 120,
		title: 'Probability and Counts Graph of Layer',
		background: null,
		view: { stroke: 'transparent' },
		data: {
			name: 'table'
		},
		mark: {
			name: 'marks',
			type: 'bar'
		},
		encoding: {
			x: {
				axis: {
					orient: 'bottom',
					grid: false,
					gridWidth: 0,
					titleColor: '#000000',
					ticks: true,
					labelFontStyle: 'ProximaNova, Sans Serif',
					titleFontStyle: 'ProximaNova, Sans Serif'
				},
				field: 'interval',
				type: 'nominal'
			}
		},
		layer: [
			{
				mark: { stroke: '#85A9C5', type: 'bar' },
				encoding: {
					y: {
						aggregate: 'average',
						field: 'counts',
						title: 'Counts',
						axis: { titleColor: '#85A9C5', orient: 'left' }
					}
				}
			},
			{
				mark: { opacity: 1, type: 'line', color: '#f55c5c', interpolate: 'cardinal' },
				encoding: {
					y: {
						aggregate: 'max',
						field: 'probability',
						title: 'Probability',
						axis: { titleColor: '#f55c5c', orient: 'right' }
					}
				}
			}
		],

		resolve: { scale: { y: 'independent' } },
		scales: [
			{
				name: 'y',
				type: 'linear'
			},
			{
				name: 'x',
				type: 'point'
			}
		]
	};

	const vegaOptions = { actions: false, renderer: 'svg' };
</script>

<main>
	<VegaLite {data} spec={specVL} bind:view={viewVL} options={vegaOptions} />
</main>

<style>
	main {
		text-align: center;
		padding: 0;
		max-width: 240px;
		margin: 0 auto;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
