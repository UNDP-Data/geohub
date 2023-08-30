<script lang="ts">
	import ElectricityLegend from './ElectricityLegend.svelte';
	import TimeSlider from './TimeSlider.svelte';

	let POVERTY_ID = 'poverty';
	const HREA_ID = 'HREA';
	const ML_ID = 'ML';
	const NONE_ID = 'NONE';

	let electricityChoices = [
		{ name: HREA_ID, icon: 'fas fa-plug-circle-bolt', title: 'High Resolution Electricity Access' },
		{ name: ML_ID, icon: 'fas fa-laptop-code', title: 'Machine Learning' },
		{ name: NONE_ID, icon: 'fas fa-ban', title: 'None' }
	];
	export let electricitySelected = electricityChoices[0];

	export let loadRasterLayer = () => {
		return;
	};
</script>

<div class="centered">
	<div class="field has-addons">
		{#each electricityChoices as choice}
			<p class="control pt-2">
				<button
					class="button {`${
						choice.name === electricitySelected.name ? 'is-info is-light is-active' : ''
					}`}"
					on:click={() => {
						electricitySelected = choice;
					}}
				>
					<span class="icon is-small">
						<i class={choice.icon} />
					</span>
					<span>{choice.name}</span>
				</button>
			</p>
		{/each}
	</div>
	<ElectricityLegend bind:electricitySelected />
</div>
<div class="raster-time-slider">
	<TimeSlider
		bind:electricitySelected
		bind:loadLayer={loadRasterLayer}
		bind:BEFORE_LAYER_ID={POVERTY_ID}
	/>
</div>

<style lang="scss">
	.raster-time-slider {
		padding-top: 1em;
		padding-bottom: 1em;
	}

	.icon {
		padding-left: 10px;
		padding-right: 20px;
	}

	:global(.centered) {
		width: max-content;
		margin: auto !important;
	}
</style>
