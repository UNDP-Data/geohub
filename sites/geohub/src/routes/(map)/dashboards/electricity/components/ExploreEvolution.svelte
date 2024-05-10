<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { onMount } from 'svelte';
	import { loadAdmin, reloadAdmin } from '../utils/adminLayer';
	import TimeSlider from './TimeSlider.svelte';

	export let electricitySelected;
	export let loadRasterLayer;
	export let POVERTY_ID;
	export let showMapLabels: boolean;

	let colorMapNameStore: string = 'pubu';
	let scaleColorList: string[] = [];
	let isReverse: boolean = false;

	const showLabelsHandler = () => {
		showMapLabels = !showMapLabels;
		reloadAdmin(scaleColorList, showMapLabels);
	};

	const colorPickerChangeHandler = (e) => {
		colorMapNameStore = e.detail.colorMapName;
		loadMapColors();
	};

	const loadMapColors = () => {
		isReverse = colorMapNameStore.indexOf('_r') !== -1;
		scaleColorList = chroma.scale(colorMapNameStore.replace('_r', '')).colors(5, 'hex');
		if (isReverse) scaleColorList.reverse();
		reloadAdmin(scaleColorList, showMapLabels);
	};

	onMount(() => {
		loadAdmin(true);
		loadMapColors();
	});
</script>

<div>
	<div class="has-background-white p-2 a-slider a-fixed">
		<TimeSlider
			bind:electricitySelected
			bind:loadLayer={loadRasterLayer}
			bind:BEFORE_LAYER_ID={POVERTY_ID}
			bind:scaleColorList
		/>
	</div>

	<div class="p-4 has-background-light">
		<p class="mb-2">Electricity access</p>
		<ColorMapPicker colorMapName={colorMapNameStore} on:change={colorPickerChangeHandler} />
		<label class="checkbox mt-2">
			<input type="checkbox" on:change={showLabelsHandler} checked={showMapLabels} />
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
			top: 125px;
			left: 367px;
			border-radius: 4px;
			box-shadow: 2px 2px 2px 0 #7d7d7d;
		}
	}
</style>
