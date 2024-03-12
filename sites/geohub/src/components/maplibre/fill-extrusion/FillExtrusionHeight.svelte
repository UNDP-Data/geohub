<script lang="ts">
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { FieldControl } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	let defaultValue = 1000;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) as unknown;

		if (!value) {
			return defaultValue;
		}

		return value;
	};

	let maxValue = 9999;
	let minValue = 0;
	let propertyName = 'fill-extrusion-height';
	let stepValue = 1;
	let value = getValue();
	let heightValue = Array.isArray(value) ? [defaultValue] : [value];

	let minExaggerationValue = 100000;
	let maxExaggerationValue = 999999;
	let exaggerationValues = [Array.isArray(value) ? value[2] : minExaggerationValue];
	let stepExaggerationValue = 1;

	let propertySelectValue = Array.isArray(value) ? value[1][1] : '';

	$: isConstantHeight = propertySelectValue.length === 0 ?? false;

	const setMinMaxExaggeration = () => {
		if (propertySelectValue.length === 0) return;
		const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);
		const max = attribute?.max;
		let minValue = 10000;
		let maxValue = 999999;
		if (max > 10000) {
			minValue = 1;
			maxValue = 99;
		} else if (max > 1000) {
			minValue = 10;
			maxValue = 990;
		} else if (max > 100) {
			minValue = 100;
			maxValue = 9999;
		} else if (max > 10) {
			minValue = 1000;
			maxValue = 99999;
		}
		minExaggerationValue = minValue;
		maxExaggerationValue = maxValue;
	};
	setMinMaxExaggeration();

	const handlePropertyChange = debounce(() => {
		if (propertySelectValue.length === 0) {
			value = heightValue[0];
		} else {
			// height by field
			if (!exaggerationValues) return;

			const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);

			const max = attribute?.max;
			let exaggerationValue = 100000;
			if (max > 10000) {
				exaggerationValue = 10;
			} else if (max > 1000) {
				exaggerationValue = 100;
			} else if (max > 100) {
				exaggerationValue = 1000;
			} else if (max > 10) {
				exaggerationValue = 10000;
			}
			setMinMaxExaggeration();
			exaggerationValues = [exaggerationValue];

			value = ['*', ['get', propertySelectValue], exaggerationValues[0]];
		}

		map.setPaintProperty(layerId, propertyName, value);
	}, 300);

	const handleExaggerationChanged = debounce(() => {
		if (propertySelectValue.length === 0) return;
		value = !propertySelectValue
			? defaultValue
			: ['*', ['get', propertySelectValue], exaggerationValues[0]];
		map.setPaintProperty(layerId, propertyName, value);
	}, 300);

	const handleConstantHeightChagned = debounce(() => {
		if (propertySelectValue.length > 0) return;
		value = heightValue[0];
		map.setPaintProperty(layerId, propertyName, value);
	}, 300);
</script>

<PropertySelect
	bind:propertySelectValue
	on:select={handlePropertyChange}
	{layerId}
	{metadata}
	onlyNumberFields={true}
	showEmptyFields={true}
	emptyFieldLabel="Use constant value for height"
/>

{#if isConstantHeight}
	<div class="mt-5">
		<div class="range-slider px-4">
			<RangeSlider
				bind:values={heightValue}
				bind:min={minValue}
				bind:max={maxValue}
				bind:step={stepValue}
				pips={true}
				first="label"
				last="label"
				rest={false}
				float
				suffix="m"
				on:change={handleConstantHeightChagned}
			/>
		</div>
	</div>
{:else}
	<FieldControl title="Height exaggeration">
		<div slot="help">
			The height exaggeration. The height value will be multiplied by this value.
			<br />
			The range of sliders is automatically set according to the selected property.
		</div>
		<div slot="control">
			<div class="range-slider px-4">
				<RangeSlider
					bind:values={exaggerationValues}
					bind:min={minExaggerationValue}
					bind:max={maxExaggerationValue}
					bind:step={stepExaggerationValue}
					pips={true}
					first="label"
					last="label"
					rest={false}
					prefix="x"
					float
					on:change={handleExaggerationChanged}
				/>
			</div>
		</div>
	</FieldControl>
{/if}

<style lang="scss">
	.range-slider {
		--range-handle-focus: #2196f3;
		--range-range-inactive: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		width: 100%;
		cursor: pointer;
	}
</style>
