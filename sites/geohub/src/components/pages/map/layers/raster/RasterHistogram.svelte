<script lang="ts">
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	export let metadata: RasterTileMetadata;
	export let tags: Tag[];

	// Chart dimensions
	const width = 300;
	const height = 200;
	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 40;
	const marginLeft = 50;

	onMount(async () => {
		const band = metadata.active_band_no;
		const counts = metadata.stats[band]['histogram'][0];
		const interval = metadata.stats[band]['histogram'][1];
		const [minCount, maxCount] = [Math.min(...counts), Math.max(...counts)];
		const unit = tags.find((tag) => tag.key === 'unit')?.value ?? 'Intervals';

		// X-scale and X-axis
		const x = d3
			.scaleBand()
			.domain(interval.map((d) => d))
			.paddingInner(1)
			.paddingOuter(0.05)
			.range([marginLeft, width - marginRight]);

		const xAxis = d3.axisBottom(x).tickValues(x.domain()).tickFormat(d3.format('.2f'));

		// Y-scale and Y-axis
		const y = d3
			.scaleLinear(d3.extent(counts))
			.domain([minCount, maxCount])
			.nice()
			.range([height - marginBottom, marginTop]);

		const yAxis = d3.axisLeft(y).tickValues(d3.ticks(minCount, maxCount, 5));

		// SVG element
		const svg = d3
			.select('main')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);

		// Appending the x-axis to the SVG container
		svg
			.append('g')
			.attr('transform', `translate(0, ${height - marginBottom})`)
			.call(xAxis)
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-0.5em')
			.attr('dy', '0.15em')
			.attr('transform', 'rotate(-45)');

		svg.append('g').attr('transform', `translate(${marginLeft}, 0)`).call(yAxis);

		// Bars
		svg
			.selectAll('rect')
			.data(counts)
			.enter()
			.append('rect')
			.attr('x', (d, i) => x(interval[i]))
			.attr('y', (d) => y(d))
			.attr('width', 23)
			.attr('height', (d) => height - marginBottom - y(d))
			.attr('padding', 1)
			.attr('stroke', 'white')
			.attr('stroke-width', 0.5)
			.attr('fill', '#006eb5')
			.on('mouseover', function (event, d) {
				// Show value on hover
				const xPos = parseFloat(d3.select(this).attr('x')) + width / counts.length / 2;
				const yPos = parseFloat(d3.select(this).attr('y'));

				// change color of bar on hover
				d3.select(this).attr('fill', 'steelblue');
				d3.select(this).style('cursor', 'pointer');

				// tooltip box
				svg
					.append('polygon')
					.attr('id', 'tooltip-fill')
					.attr('points', `${xPos - 5},${yPos - 5} ${xPos + 5},${yPos - 5} ${xPos},${yPos}`)
					.attr('fill', 'black');
				svg
					.append('rect')
					.attr('id', 'tooltip-rect')
					.attr('x', xPos - 30)
					.attr('y', yPos - 30)
					.attr('width', 60)
					.attr('height', 20)
					.attr('fill', 'black')
					.attr('rx', 5)
					.attr('ry', 5);
				// add text to tooltip box and center it
				svg
					.append('text')
					.attr('id', 'tooltip-text')
					.attr('x', xPos)
					.attr('y', yPos - 15)
					.attr('text-anchor', 'middle')
					.attr('fill', 'white')
					.text(d);
			})
			.on('mouseout', function () {
				// Remove the tooltip on mouseout
				d3.select('#tooltip-text').remove();
				d3.select('#tooltip-rect').remove();
				d3.select('#tooltip-fill').remove();
				// change color of bar
				d3.select(this).attr('fill', '#006eb5');
				d3.select(this).style('cursor', 'default');
			});

		// Y-axis label
		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', `translate(${marginLeft + 5}, ${marginTop - 12}) rotate(0)`)
			.style('font-size', '12px')
			.style('font-weight', 'bold')
			.text('Number of pixels');

		// X-axis label
		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', `translate(${width / 2}, ${height}) rotate(0)`)
			.style('font-size', '12px')
			.style('font-weight', 'bold')
			.text(`${unit}`);
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
