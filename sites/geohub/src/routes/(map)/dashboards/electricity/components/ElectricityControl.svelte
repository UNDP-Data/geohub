<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import {
		ELECTRICITY_DATATYPE_CONTEXT_KEY,
		electricityDataTypes,
		type ElectricityDataTypeStore
	} from '../stores/electricityDataType';
	import ElectricityLegend from './ElectricityLegend.svelte';

	const dispatch = createEventDispatcher();

	const electricityDataType: ElectricityDataTypeStore = getContext(
		ELECTRICITY_DATATYPE_CONTEXT_KEY
	);

	const HREA_ID = 'HREA';

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
	<div class="button-container mt-2">
		{#each electricityDataTypes as choice}
			<button
				class="button data-option {`${choice.value === $electricityDataType ? 'is-active' : ''}`}"
				on:click={() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					$electricityDataType = choice.value;
				}}
			>
				<span class="is-size-7">{choice.title}</span>
			</button>
		{/each}
	</div>

	<ElectricityLegend bind:electricitySelected on:onRasterColorMapChange={updateRasterColorMap} />
</div>

<style lang="scss">
	.data-title {
		background-color: #edf5fd;
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
