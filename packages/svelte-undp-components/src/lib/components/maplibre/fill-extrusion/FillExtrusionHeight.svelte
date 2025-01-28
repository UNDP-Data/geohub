<script lang="ts">
	import PropertySelect from '$lib/components/maplibre/util/PropertySelect.svelte';
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata.js';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { Switch } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: VectorTileMetadata;
	}

	let { layerId = $bindable(), metadata = $bindable() }: Props = $props();

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

	let maxValue = $state(9999);
	let minValue = $state(0);
	let propertyName = 'fill-extrusion-height';
	let stepValue = $state(1);
	let value = getValue();
	let heightValue: number[] = $state(Array.isArray(value) ? [defaultValue] : [value as number]);

	let minExaggerationValue = $state(100000);
	let maxExaggerationValue = $state(999999);
	const getDefaultExaggerationValue = () => {
		return [Array.isArray(value) ? value[2] : minExaggerationValue];
	};
	let exaggerationValues = $state(getDefaultExaggerationValue());
	let stepExaggerationValue = $state(1);

	const getPropertyValueFromExpression = () => {
		if (Array.isArray(value)) {
			if (value[1][0] === 'ln') {
				return value[1][1][1];
			} else {
				return value[1][1];
			}
		} else {
			return '';
		}
	};

	const getLogState = () => {
		return Array.isArray(value) && value[1][0] === 'ln';
	};

	let isLogarithmic = $state(getLogState());
	let propertySelectValue = $state(getPropertyValueFromExpression());

	let isConstantHeight = $derived(propertySelectValue.length === 0);

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

			value = ['*', getPropertyExpression(), exaggerationValues[0]];
		}

		map.setPaintProperty(layerId, propertyName, value);
	}, 300);

	const handleExaggerationChanged = debounce(() => {
		if (propertySelectValue.length === 0) return;
		value = !propertySelectValue
			? defaultValue
			: ['*', getPropertyExpression(), exaggerationValues[0]];
		map.setPaintProperty(layerId, propertyName, value);
	}, 300);

	const getPropertyExpression = () => {
		const property = ['get', propertySelectValue];
		if (isLogarithmic) {
			return ['ln', property];
		} else {
			return property;
		}
	};

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
	<div class="mt-5 mx-2">
		<Slider
			bind:values={heightValue}
			bind:min={minValue}
			bind:max={maxValue}
			bind:step={stepValue}
			first="label"
			last="label"
			rest={false}
			suffix="m"
			on:change={handleConstantHeightChagned}
		/>
	</div>
{:else}
	<FieldControl title="Height exaggeration">
		{#snippet help()}
			<div>
				The height exaggeration. The height value will be multiplied by this value.
				<br />
				The range of sliders is automatically set according to the selected property. If the data is
				highly skewed, please try to use logarithmic. It may work better.
			</div>
		{/snippet}
		{#snippet control()}
			<div class="mx-2">
				<Slider
					bind:values={exaggerationValues}
					bind:min={minExaggerationValue}
					bind:max={maxExaggerationValue}
					bind:step={stepExaggerationValue}
					first="label"
					last="label"
					rest={false}
					floatLabel={false}
					on:change={handleExaggerationChanged}
					formatter={(value) => {
						if (value === minExaggerationValue) {
							return 'Low';
						} else if (value === maxExaggerationValue) {
							return 'High';
						} else {
							return '';
						}
					}}
				/>
				<div class="pt-2">
					<Switch
						bind:toggled={isLogarithmic}
						toggledText="Logarithmic is enabled"
						untoggledText="Logarithmic is disabled"
						showValue={true}
						on:change={handleExaggerationChanged}
					/>
				</div>
			</div>
		{/snippet}
	</FieldControl>
{/if}
