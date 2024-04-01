<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';
	import { map } from '../stores';
	import { loadAdmin } from '../utils/adminLayer';
	import TimeSlider from './TimeSlider.svelte';

	export let electricitySelected;
	export let loadRasterLayer;
	export let POVERTY_ID;
	export let showMapLabels: boolean;

	const showLabelsHandler = () => {
		showMapLabels = !showMapLabels;

		if ($map) {
			loadAdmin(!showMapLabels);
		}
	};

	const colorPickerChangeHandler = (e) => {
		console.log(e);
	};
</script>

<div>
	<div class="has-background-white p-2 a-slider a-fixed">
		<TimeSlider
			bind:electricitySelected
			bind:loadLayer={loadRasterLayer}
			bind:BEFORE_LAYER_ID={POVERTY_ID}
		/>
	</div>

	<div class="p-4 has-background-light">
		<p class="mb-2">Electricity access</p>
		<ColorMapPicker colorMapName="pubu" on:change={colorPickerChangeHandler} />
		<label class="checkbox mt-2">
			<input type="checkbox" on:change={showLabelsHandler} checked={!showMapLabels} />
			Show Labels
		</label>
	</div>
</div>

<style lang="scss">
	.a {
		&-fixed {
			position: fixed;
			z-index: 9;
		}

		&-slider {
			width: 300px;
			top: 165px;
			left: 367px;
			border-radius: 4px;
			box-shadow: 2px 2px 2px 0 #7d7d7d;
		}
	}
</style>
