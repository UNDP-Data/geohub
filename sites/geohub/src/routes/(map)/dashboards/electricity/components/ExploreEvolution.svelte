<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { onMount } from 'svelte';
	import { loadAdmin, reloadAdmin } from '../utils/adminLayer';

	export let showMapLabels: boolean;

	let colorMapNameStore: string = 'pubu';
	export let scaleColorList: string[] = [];
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

<div class="mt-2 p-4 has-background-light">
	<p class="mb-2">Electricity access</p>
	<ColorMapPicker colorMapName={colorMapNameStore} on:change={colorPickerChangeHandler} />
	<label class="checkbox mt-2">
		<input type="checkbox" on:change={showLabelsHandler} checked={showMapLabels} />
		Show Labels
	</label>
</div>
