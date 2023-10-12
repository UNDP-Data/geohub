<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import StyleControlGroup from '$components/util/StyleControlGroup.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let defaultValue: number;
	export let layer: Layer;
	export let layerType: string;
	export let maxValue: number;
	export let minValue: number;
	export let propertyName: string;
	export let propertyType: 'paint' | 'layout' = 'paint';
	export let stepValue: number;
	export let titleName: string;
	export let styleControlGroupDisabled = false;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const getValue = () => {
		let value =
			propertyType === 'paint'
				? $map.getPaintProperty(layerId, propertyName)
				: $map.getLayoutProperty(layerId, propertyName);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!value || (value && value.type === 'interval')) {
			value = defaultValue;
		}
		return Number(value);
	};

	let values = [getValue()];

	$: values, setValue();

	const setValue = () => {
		if (style?.type !== layerType) return;
		const newStyle = JSON.parse(JSON.stringify(style));
		if (!newStyle[propertyType]) {
			newStyle[propertyType] = {};
		}
		newStyle[propertyType][propertyName] = values[0];

		if (propertyType === 'paint') {
			map.setPaintProperty(layerId, propertyName, values[0]);
		} else {
			map.setLayoutProperty(layerId, propertyName, values[0]);
		}

		dispatch('change', {
			value: values[0]
		});
	};
</script>

{#if style?.type === layerType}
	{#if !styleControlGroupDisabled}
		<StyleControlGroup title={titleName}>
			<div class="range-slider">
				<RangeSlider
					bind:values
					float
					min={minValue}
					max={maxValue}
					step={stepValue}
					pips
					first="label"
					last="label"
					rest={false}
				/>
			</div>
		</StyleControlGroup>
	{:else}
		<div class="range-slider">
			<RangeSlider
				bind:values
				float
				min={minValue}
				max={maxValue}
				step={stepValue}
				pips
				first="label"
				last="label"
				rest={false}
			/>
		</div>
	{/if}
{/if}

<style lang="scss">
	@import '../../../styles/vector-style-slider.scss';
</style>
