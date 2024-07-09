<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ElectricityLegend from './ElectricityLegend.svelte';

	const dispatch = createEventDispatcher();

	const HREA_ID = 'HREA';

	let electricityChoices = [{ name: HREA_ID, title: 'Electricity Access Data' }];

	export let electricitySelected = HREA_ID;

	let rasterColorMapName = 'pubu';

	function updateRasterColorMap(event) {
		rasterColorMapName = event.detail.rasterColorMapName;
		dispatch('change', {
			colormapName: rasterColorMapName
		});
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

<style lang="scss">
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
