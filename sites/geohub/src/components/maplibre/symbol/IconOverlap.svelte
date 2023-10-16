<script lang="ts">
	import RangeSlider from 'svelte-range-slider-pips';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const choices = ['never', 'always', 'cooperative'];
	const layerId = layer.id;
	const propertyName = 'icon-overlap';
	let selected = [
		choices.findIndex((choice) => choice === $map.getLayoutProperty(layerId, propertyName))
	];

	$: selected, setIconOverlap();

	const setIconOverlap = () => {
		map.setLayoutProperty(layerId, propertyName, choices[selected[0]]);
	};
</script>

<div data-testid="icon-overlap-slider" class="range-slider" style="width: 130px;">
	<RangeSlider
		bind:values={selected}
		min={0}
		formatter={(v) => choices[v].toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase())}
		max={choices.length - 1}
		all="label"
		pips
	/>
</div>

<style lang="scss">
	.range-slider {
		--range-handle-focus: #2196f3;
		--range-range-inactive: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		width: 100%;
		cursor: pointer;
		font-size: 11px;
	}
</style>
