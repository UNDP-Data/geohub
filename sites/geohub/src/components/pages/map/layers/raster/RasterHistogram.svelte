<script lang="ts">
	import type { RasterTileMetadata } from '$lib/types';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	export let metadata: RasterTileMetadata;

	// Chart dimensions
	const width = 300;
	const height = 200;
	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 30;
	const marginLeft = 40;
	let x;
	let y;
	let svg;

	onMount(async () => {
		const band = metadata.active_band_no;
		const counts = metadata.stats[band]['histogram'][0];
		const interval = metadata.stats[band]['histogram'][1];
		const midIntervals = interval.map((item, index) => {
			if (index === interval.length - 1) {
				return item;
			}
			return (item + interval[index + 1]) * 0.5;
		});

		const [minInterval, maxInterval] = d3.extent(interval);
		const [minCount, maxCount] = d3.extent(counts);

		// x-axis
		x = d3
			.scaleLinear(d3.extent(midIntervals))
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

		svg
			.append('g')
			.attr('transform', `translate(0, ${height - marginBottom})`)
			.call(d3.axisBottom(x));
		svg.append('g').attr('transform', `translate(${marginLeft}, 0)`).call(d3.axisLeft(y));

		const barWidth = (width - (marginLeft + marginRight)) / counts.length;

		// add square grid lines
		svg
			.selectAll('line')
			.data(counts)
			.enter()
			.append('line')
			.attr('x1', (d, i) => x(interval[i]))
			.attr('y1', (d) => y(d))
			.attr('x2', (d, i) => x(interval[i]))
			.attr('y2', height - marginBottom)
			.attr('stroke', 'lightgray');

		svg
			.selectAll('rect')
			.data(counts)
			.enter()
			.append('rect')
			.attr('x', (d, i) => x(interval[i]))
			.attr('y', (d) => y(d))
			.attr('width', barWidth - 1)
			.attr('height', (d) => height - marginBottom - y(d))
			.attr('padding', 1)
			.attr('fill', 'steelblue');

		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', `translate(${width / 2}, ${height - marginBottom / 10})`)
			.text('Intervals');
	});
</script>

<main></main>

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
