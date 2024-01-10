<script lang="ts">
	import type { RasterTileMetadata } from '$lib/types';
	import { onMount } from 'svelte';
	// import { VegaLite, type VisualizationSpec } from 'svelte-vega';
	import * as d3 from 'd3';
	export let metadata: RasterTileMetadata;

	// Chart dimensions
	const width = 300;
	const height = 300;
	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 30;
	const marginLeft = 40;
	let x;
	let y;
	let svg;

	let numberOfTicks = 10;

	onMount(async () => {
		const band = metadata.active_band_no;
		const counts = metadata.stats[band]['histogram'][0];
		const interval = metadata.stats[band]['histogram'][1];

		for (let i = 0; i < interval.length - 1; i++) {
			interval[i] = (interval[i] + interval[i + 1]) * 0.5;
		}
		const [minInterval, maxInterval] = d3.extent(interval);
		const [minCount, maxCount] = d3.extent(counts);

		// x-axis
		x = d3
			.scaleLinear(d3.extent(interval))
			.domain([minInterval, maxInterval])
			.nice()
			.range([marginLeft, width - marginRight]);

		// y-axis
		y = d3
			.scaleLinear(d3.extent(counts))
			.domain([minCount, maxCount])
			.nice()
			.range([height - marginBottom, marginTop]);

		// create svg
		svg = d3
			.select('main')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);

		// add x and y axes
		// show only 10 ticks
		const xTicks = x.ticks(numberOfTicks);
		svg
			.append('g')
			.attr('transform', `translate(0, ${height - marginBottom})`)
			.call(d3.axisBottom(x).tickValues(xTicks));
		// svg.append('g')
		//     .attr('transform', `translate(0, ${height - marginBottom})`)
		//     .call(d3.axisBottom(x));
		svg.append('g').attr('transform', `translate(${marginLeft}, 0)`).call(d3.axisLeft(y));

		const barWidth = (width - (marginLeft + marginRight)) / counts.length;

		svg
			.selectAll('rect')
			.data(counts)
			.enter()
			.append('rect')
			.attr('x', (d, i) => x(interval[i]))
			.attr('y', (d) => y(d))
			.attr('width', barWidth)
			.attr('height', (d) => height - marginBottom - y(d))
			.attr('padding', 0)
			.attr('fill', 'steelblue');

		// add labels to axes
		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', `translate(${1}, ${height / 2})rotate(-90)`)
			.text('Counts');
		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', `translate(${width / 2}, ${height - marginBottom / 10})`)
			.text('Intervals');

		// if (probability[0] > 0) {
		// 	probability.unshift(0);
		// }
		// if (probability[probability.length - 1] < 1) {
		// 	probability.push(0);
		// }
		//
		// interval.slice(1).map((item, index) => {
		// 	table.push({
		// 		interval: Number(item.toFixed(2)),
		// 		probability: Number(probability[index].toFixed(2)),
		// 		counts: Number(counts[index].toFixed(2))
		// 	});
		// });
		//
		// data = { table: table };
	});

	// let viewVL;
	// let specVL: VisualizationSpec = {
	// 	$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
	// 	padding: 0,
	// 	width: 200,
	// 	height: 120,
	// 	title: 'Probability and Counts Graph of Layer',
	// 	background: null,
	// 	view: { stroke: 'transparent' },
	// 	data: {
	// 		name: 'table'
	// 	},
	// 	mark: {
	// 		name: 'marks',
	// 		type: 'bar'
	// 	},
	// 	encoding: {
	// 		x: {
	// 			axis: {
	// 				orient: 'bottom',
	// 				grid: false,
	// 				gridWidth: 0,
	// 				titleColor: '#000000',
	// 				ticks: true,
	// 				labelFontStyle: 'ProximaNova, Sans Serif',
	// 				titleFontStyle: 'ProximaNova, Sans Serif',
	// 				labelOverlap: 'greedy'
	// 			},
	// 			field: 'interval',
	// 			type: 'nominal'
	// 		}
	// 	},
	// 	layer: [
	// 		{
	// 			mark: { stroke: '#85A9C5', type: 'bar' },
	// 			encoding: {
	// 				y: {
	// 					aggregate: 'average',
	// 					field: 'counts',
	// 					title: 'Counts',
	// 					axis: { titleColor: '#85A9C5', orient: 'left' }
	// 				}
	// 			}
	// 		},
	// 		{
	// 			mark: { opacity: 1, type: 'line', color: '#f55c5c', interpolate: 'cardinal' },
	// 			encoding: {
	// 				y: {
	// 					aggregate: 'max',
	// 					field: 'probability',
	// 					title: 'Probability',
	// 					axis: { titleColor: '#f55c5c', orient: 'right' }
	// 				}
	// 			}
	// 		}
	// 	],
	//
	// 	resolve: { scale: { y: 'independent' } },
	// 	scales: [
	// 		{
	// 			name: 'y',
	// 			type: 'linear'
	// 		},
	// 		{
	// 			name: 'x',
	// 			type: 'point'
	// 		}
	// 	]
	// };
	//
	// const vegaOptions = { actions: false, renderer: 'svg' };
</script>

<main>
	<!--	<VegaLite {data} spec={specVL} bind:view={viewVL} options={vegaOptions} />-->
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
