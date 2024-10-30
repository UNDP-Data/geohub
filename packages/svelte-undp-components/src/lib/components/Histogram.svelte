<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	export let counts: number[];
	export let bins: number[];
	export let unit = '';
	export let xLabel = '';
	export let yLabel = '';

	// Chart dimensions
	const width = 300;
	const height = 200;
	const marginTop = 20;
	const marginRight = 10;
	const marginBottom = 30;
	const marginLeft = 40;

	let diagramElement: HTMLDivElement;

	onMount(() => {
		const [minCount, maxCount] = [Math.min(...counts), Math.max(...counts)];

		const data = counts.map((count, i) => ({ count, interval: [bins[i], bins[i + 1]] }));

		// X-scale and X-axis
		const x = d3
			.scaleBand()
			.domain(bins.map((d) => d))
			.paddingInner(1)
			.paddingOuter(1)
			.range([marginLeft, width - marginRight]);

		const xAxis = d3
			.axisBottom(x)
			.tickValues(x.domain().filter((_, i) => i % Math.ceil(x.domain().length / 6) === 0))
			.tickSizeOuter(0)
			.tickFormat((d) => d.toFixed());

		// Y-scale and Y-axis
		const y = d3
			.scaleLinear(d3.extent(counts))
			.domain([minCount, maxCount])
			.nice()
			.range([height - marginBottom, marginTop])
			.clamp(false);

		const yAxis = d3
			.axisLeft(y)
			.tickValues(d3.ticks(minCount, maxCount, 4))
			.tickFormat(d3.format('.2s'));

		// SVG element
		const svg = d3
			.select(diagramElement)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.style('overflow', 'visible')
			.attr('viewBox', [0, 0, width, height]);

		// horizontal dotted grid lines
		svg
			.append('g')
			.attr('class', 'grid')
			.attr('transform', `translate(${marginLeft}, 0)`)
			.style('stroke-dasharray', '2,2')
			.style('stroke-opacity', 0.5)
			.call(yAxis.tickSize(-width + marginLeft + marginRight));

		// removing the y-axis line
		svg.select('.domain').remove();

		svg
			.append('g')
			.attr('transform', `translate(0, ${height - marginBottom})`)
			.call(xAxis)
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-0.5em')
			.attr('dy', '0.15em')
			.attr('transform', 'translate(3, 0) rotate(-30)');

		// Bars
		svg
			.selectAll('rect')
			.data(counts)
			.enter()
			.append('rect')
			.attr('x', (d, i) => x(bins[i]))
			.attr('y', (d) => y(d))
			.attr('width', 20)
			.attr('height', (d) => height - marginBottom - y(d))
			.attr('padding', 1)
			.attr('stroke', 'white')
			.attr('stroke-width', 0.5)
			.attr('fill', '#006eb5')
			.on('mouseover', function (event, d) {
				// Show value on hover
				const xPos = parseFloat(d3.select(this).attr('x')) + width / counts.length / 2;
				const yPos = parseFloat(d3.select(this).attr('y'));

				d3.select(this.parentNode).selectAll('rect').attr('opacity', 0.2);
				// make the whole chart except the hovered bar transparent
				d3.select(this.parentNode).selectAll('g').attr('opacity', 0.5);
				d3.select(this).attr('opacity', 1);
				d3.select(this).style('cursor', 'pointer');

				// Setting the position for the tooltip
				const tooltipWidth = 150;
				const tooltipHeight = 80;
				const offsetX = 15;
				const offsetY = 90;

				const adjustedX = Math.min(xPos - offsetX, width - tooltipWidth);
				const adjustedY = Math.min(yPos - offsetY, height - tooltipHeight);

				// Append a group element for the tooltip
				var tooltipGroup = svg
					.append('g')
					.attr('id', 'tooltip-group')
					.attr('transform', 'translate(' + adjustedX + ',' + adjustedY + ')');

				tooltipGroup
					.append('rect')
					.attr('id', 'tooltip-rect')
					.attr('width', tooltipWidth)
					.attr('height', tooltipHeight)
					.attr('fill', '#F7F7F7');

				const currentInterval = data.find((item) => item.count === d)?.interval;
				const maxTextLength = 20;

				const text = currentInterval
					? `${[currentInterval[0].toFixed(0), currentInterval[1].toFixed(0)].join(' - ')} ${unit}`
					: '';
				const truncatedText =
					text.length > maxTextLength ? `${text.slice(0, maxTextLength - 3)}...` : text;

				tooltipGroup
					.append('text')
					.attr('x', 2)
					.attr('y', 20)
					.attr('text-overflow', 'clip')
					.style('fill', '#006eb5')
					.style('font-weight', 'bold')
					.text(truncatedText);

				tooltipGroup
					.append('line')
					.attr('x1', 10)
					.attr('y1', 30)
					.attr('x2', tooltipWidth - 10)
					.attr('y2', 30)
					.attr('class', 'is-divider mt-1 mb-0')
					.style('stroke', '#D4D6D8');

				if (yLabel) {
					tooltipGroup
						.append('text')
						.attr('x', 2)
						.attr('y', 45)
						.attr('class', 'has-text-weight-medium')
						.text(yLabel);
				}

				tooltipGroup
					.append('text')
					.attr('x', 2)
					.attr('y', 65)
					.attr('class', 'has-text-weight-bold')
					.text(d);
			})
			.on('mouseout', function () {
				d3.selectAll('rect').attr('opacity', 1);
				d3.select(this.parentNode).selectAll('g').attr('opacity', 1);
				d3.select(this).attr('fill', '#006eb5');
				d3.select(this).style('cursor', 'default');
				d3.select('#tooltip-group').remove();
			});

		if (yLabel) {
			// Y-axis label
			svg
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('transform', `translate(${marginLeft / 4}, ${height / 2}) rotate(-90)`)
				.style('font-size', '15px')
				.style('font-weight', 'bold')
				.text(yLabel);
		}

		if (xLabel) {
			// X-axis label
			svg
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('transform', `translate(${width / 2}, ${height + 20}) rotate(0)`)
				.style('font-size', '15px')
				.style('font-weight', 'bold')
				.text(`${xLabel}`);
		}
	});
</script>

<div class="diagram" bind:this={diagramElement}></div>

<style lang="scss">
	.diagram {
		text-align: center;
		padding: 0;
		max-width: 240px;
		margin: 0 auto;

		@media (min-width: 640px) {
			max-width: none;
		}
	}
</style>
