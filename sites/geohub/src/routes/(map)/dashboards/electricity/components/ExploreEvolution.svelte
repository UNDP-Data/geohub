<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { onMount } from 'svelte';
	import { loadAdmin, reloadAdmin } from '../utils/adminLayer';

	let colorMapNameStore: string = $state('pubu');
	interface Props {
		showMapLabels: boolean;
		scaleColorList?: string[];
	}

	let { showMapLabels = $bindable(), scaleColorList = $bindable([]) }: Props = $props();
	let isReverse: boolean = false;

	const showLabelsHandler = () => {
		showMapLabels = !showMapLabels;
		reloadAdmin(scaleColorList, showMapLabels);
	};

	const colorPickerChangeHandler = (colorMapName: string) => {
		colorMapNameStore = colorMapName;
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
	<ColorMapPicker colorMapName={colorMapNameStore} onchange={colorPickerChangeHandler} />
	<label class="checkbox mt-2">
		<input type="checkbox" onchange={showLabelsHandler} checked={showMapLabels} />
		Show Labels
	</label>
</div>
