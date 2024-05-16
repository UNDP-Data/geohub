<script lang="ts">
	import { SegmentButtons } from '@undp-data/svelte-undp-components';
	import ElectricityLegend from './ElectricityLegend.svelte';
	import TimeSlider from './TimeSlider.svelte';

	let POVERTY_ID = 'poverty';
	const HREA_ID = 'HREA';
	const ML_ID = 'ML';
	const NONE_ID = 'NONE';

	let electricityChoices = [
		{ value: HREA_ID, title: HREA_ID, icon: 'fas fa-plug-circle-bolt' },
		{ value: ML_ID, title: ML_ID, icon: 'fas fa-laptop-code' },
		{ value: NONE_ID, title: NONE_ID, icon: 'fas fa-ban' }
	];

	let selectedValue = electricityChoices[0].value;

	export let loadRasterLayer = () => {
		return;
	};
</script>

<div class="is-flex is-justify-content-center">
	<SegmentButtons
		buttons={electricityChoices}
		bind:selected={selectedValue}
		size="small"
		capitalized={true}
	/>
</div>
<ElectricityLegend bind:electricitySelected={selectedValue} />

<div class="raster-time-slider">
	<TimeSlider
		bind:electricitySelected={selectedValue}
		bind:loadLayer={loadRasterLayer}
		bind:BEFORE_LAYER_ID={POVERTY_ID}
	/>
</div>

<style lang="scss">
	.raster-time-slider {
		padding-top: 1em;
		padding-bottom: 1em;
	}
</style>
