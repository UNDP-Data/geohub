<script lang="ts">
	import { onMount } from 'svelte';
	import { loadAdmin, reloadAdmin } from '../utils/adminLayer';
	export let loadAdminLabels = true;
	export let propertyA = `hrea_2020`;
	export let propertyB = `hrea_2012`;
	export let selectedRow = null;
	export let selectedCol = null;
	export let showLegend = true;

	const maxValue = 1;
	const defaultColor = 'hsla(0, 0%, 100%, 0)';
	const colorGrid = [
		['#F3618C', '#CE5495', '#A9469E', '#8339A6', '#5E2BAF'],
		['#F689A9', '#B679A9', '#916CB2', '#6C5EBB', '#4750C3'],
		['#F9B0C6', '#B9A1C6', '#7A91C6', '#5583CE', '#2F76D7'],
		['#FCD8E2', '#BDC8E3', '#7DB8E2', '#3DA8E2', '#189BEB'],
		['#FFFFFF', '#BFEFFF', '#80E0FF', '#40D0FF', '#00C0FF']
	];

	let colorExpression;

	const updateColorExpression = (propertyA, propertyB, selectedRow, selectedCol) => {
		let expression;
		expression = [];
		for (let row = 0; row < colorGrid.length; row++) {
			if (row !== 0 && row !== colorGrid.length) {
				expression.push((row / colorGrid.length) * maxValue);
			}

			let subexpression;
			subexpression = ['step', ['get', propertyB]];
			for (let col = 0; col < colorGrid[row].length; col++) {
				if (col !== 0 && col !== colorGrid[row].length) {
					subexpression.push((col / colorGrid[row].length) * maxValue);
				}

				if (
					(selectedRow === null && selectedCol === null) ||
					(selectedRow === colorGrid.length - 1 - row && selectedCol === col)
				) {
					subexpression.push(colorGrid[colorGrid.length - 1 - row][col]);
				} else {
					subexpression.push(defaultColor);
				}
			}
			expression.push(subexpression);
		}

		colorExpression = [
			'case',
			['any', ['==', ['get', propertyA], null], ['==', ['get', propertyB], null]],
			defaultColor,
			['step', ['get', propertyA], ...expression]
		];

		reloadAdmin(undefined, loadAdminLabels, colorExpression);
		return colorExpression;
	};
	$: colorExpression = updateColorExpression(propertyA, propertyB, selectedRow, selectedCol);

	const gridSelectHandler = (rowIndex: number, colIndex: number) => {
		if (selectedRow === rowIndex && selectedCol === colIndex) {
			selectedRow = null;
			selectedCol = null;
		} else {
			selectedRow = rowIndex;
			selectedCol = colIndex;
		}
	};

	onMount(() => {
		loadAdmin(true);
		reloadAdmin(undefined, loadAdminLabels, colorExpression);
	});
</script>

<div class="has-background-light p-4">
	<button
		class="a-reset a-legend__button is-flex is-justify-content-space-between {showLegend
			? 'mb-4 clicked'
			: ''}"
		type="button"
		on:click={() => (showLegend = !showLegend)}>Legend</button
	>

	{#if showLegend}
		<div>
			<div class="is-flex is-flex-wrap-wrap is-justify-content-space-between mb-2">
				<div class="is-size-7 is-flex is-flex-direction-column">
					<strong>Wealth</strong>
					<div class="is-flex-grow-1">100%</div>
					<div>0%</div>
					<div><br /><br /></div>
				</div>
				<div>
					<div class="is-flex is-flex-direction-column">
						{#each colorGrid as row, rowIndex}
							<div class="is-flex">
								{#each row as color, colIndex}
									<button
										class="a-legend__item"
										class:selected={selectedRow === rowIndex && selectedCol === colIndex}
										style="background-color: {color};"
										on:click={() => gridSelectHandler(rowIndex, colIndex)}
									></button>
								{/each}
							</div>
						{/each}
					</div>
					<div class="is-flex is-flex-direction-column is-size-7">
						<div class="is-flex">
							<div class="is-flex-grow-1">0%</div>
							<div>100%</div>
						</div>
						<strong>Energy access</strong>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.a {
		&-reset {
			all: unset;
		}

		&-legend {
			&__item {
				width: 39px;
				height: 39px;
				margin: 0.5px;
				background-color: #f9f9f9;
				border: 1px solid #d4d6d8;
				cursor: pointer;
				transition: all ease 0.3s;

				&:hover {
					border: 1px solid #006eb5;
				}

				&.selected {
					border: 1px solid #006eb5;
				}
			}

			&__button {
				width: 100%;
				cursor: pointer;

				&:after {
					content: '\f077';
					font-family: 'Font Awesome 5 Free';
					font-weight: 900;

					-webkit-transition: all 0.3s ease;
					-moz-transition: all 0.3s ease;
					-ms-transition: all 0.3s ease;
					-o-transition: all 0.3s ease;
					transition: all 0.3s ease;
				}

				&.clicked:after {
					transform: rotate(180deg);
					-webkit-transform: rotate(180deg);
					-moz-transform: rotate(180deg);
					-ms-transform: rotate(180deg);
					-o-transform: rotate(180deg);
					transition: rotateZ(180deg);
				}
			}
		}
	}
</style>
