<script lang="ts">
	import ElectricityLegend from './ElectricityLegend.svelte';
	import TimeSlider from './TimeSlider.svelte';

	let POVERTY_ID = 'poverty';
	const HREA_ID = 'HREA';
	const ML_ID = 'ML';

	let electricityChoices = [
		{ name: HREA_ID, title: 'Electricity Access Data' },
		{ name: ML_ID, title: 'Machine Learning Data' }
	];

	export let electricitySelected = HREA_ID;

	let rasterColorMapName = 'pubu';

	export let loadRasterLayer = () => {
		return;
	};

	function updateRasterColorMap(event) {
		rasterColorMapName = event.detail.rasterColorMapName;
		console.log('rasterColorMapName');
		console.log(rasterColorMapName);
	}
</script>

<div>
	<div class="button-container">
		{#each electricityChoices as choice}
			<button
				class="button data-option {`${choice.name === electricitySelected ? 'is-active' : ''}`}"
				on:click={() => {
					electricitySelected = choice.name;
				}}
			>
				<span>{choice.title}</span>
			</button>
		{/each}
	</div>
	<ElectricityLegend bind:electricitySelected on:onRasterColorMapChange={updateRasterColorMap} />
</div>

<div class="has-background-white p-2 a-slider a-fixed">
	<TimeSlider
		bind:electricitySelected
		bind:loadLayer={loadRasterLayer}
		bind:rasterColorMapName
		bind:BEFORE_LAYER_ID={POVERTY_ID}
	/>
</div>

<style lang="scss">
	.a {
		&-fixed {
			position: fixed;
			z-index: 9;
		}

		&-slider {
			width: 300px;
			top: 125px;
			left: 367px;
			border-radius: 4px;
			box-shadow: 2px 2px 2px 0 #7d7d7d;
		}
	}
	.button-container {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;

		button {
			&.data-option {
				justify-content: flex-start;
				background-color: #fff;
				&.is-active {
					background-color: #edf5fd;
				}
			}
		}
	}

	.raster-time-slider {
		padding-top: 1em;
		padding-bottom: 1em;
	}
</style>
