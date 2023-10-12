<script lang="ts">
	import RangeSlider from 'svelte-range-slider-pips';

	import { getLayerStyle } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const getLayerOpacity = (target: Layer) => {
		const id = target.id;
		const style = getLayerStyle($map, target.id);
		let opacity: number;
		switch (style.type) {
			case 'raster':
				opacity = $map.getPaintProperty(id, 'raster-opacity') as number;
				break;
			case 'symbol':
				opacity = $map.getPaintProperty(id, 'icon-opacity') as number;
				break;
			case 'line':
				opacity = $map.getPaintProperty(id, 'line-opacity') as number;
				break;
			case 'fill':
				opacity = $map.getPaintProperty(id, 'fill-opacity') as number;
				break;
			case 'heatmap':
				opacity = $map.getPaintProperty(id, 'heatmap-opacity') as number;
				break;
			default:
				break;
		}
		if (!opacity) {
			opacity = 1;
		}
		return opacity;
	};

	let layerOpacity = getLayerOpacity(layer);
	let rangeSliderValues = [layerOpacity * 100];

	$: layerOpacity = rangeSliderValues[0] / 100;
	$: layerOpacity, setOpacity();

	const setOpacity = () => {
		layer.children?.forEach((child: Layer) => {
			setLayerOpacity(child);
		});
		setLayerOpacity(layer);
	};

	const setLayerOpacity = (target: Layer) => {
		const id = target.id;
		const style = getLayerStyle($map, target.id);
		if (!style) return;
		switch (style.type) {
			case 'raster':
				map.setPaintProperty(id, 'raster-opacity', layerOpacity);
				break;
			case 'symbol':
				map.setPaintProperty(id, 'icon-opacity', layerOpacity);
				map.setPaintProperty(id, 'text-opacity', layerOpacity);
				break;
			case 'line':
				map.setPaintProperty(id, 'line-opacity', layerOpacity);
				break;
			case 'fill':
				map.setPaintProperty(id, 'fill-opacity', layerOpacity);
				break;
			case 'heatmap':
				map.setPaintProperty(id, 'heatmap-opacity', layerOpacity);
				break;
			default:
				break;
		}
	};
</script>

<div class="action" data-testid="opacity-panel-container">
	<div class="range-slider">
		<RangeSlider
			bind:values={rangeSliderValues}
			float
			min={0}
			max={100}
			step={1}
			pips
			first="label"
			last="label"
			rest={false}
			suffix="%"
		/>
	</div>
</div>

<style lang="scss">
	.action {
		margin-bottom: 25px;

		.range-slider {
			--range-handle-focus: #2196f3;
			--range-range-inactive: #2196f3;
			--range-handle-inactive: #2196f3;
			--range-handle: #2196f3;
		}
	}
</style>
