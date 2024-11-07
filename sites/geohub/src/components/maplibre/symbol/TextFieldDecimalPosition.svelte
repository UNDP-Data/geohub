<script context="module" lang="ts">
	import type { Map } from 'maplibre-gl';
	export const getDecimalPosition = (map: Map, layerId: string) => {
		let decimalPosition = 1;
		const textField = map.getLayoutProperty(layerId, 'text-field');
		if (textField) {
			if (Array.isArray(textField)) {
				if (textField[0] === 'number-format') {
					if (textField[2]['min-fraction-digits'] === textField[2]['max-fraction-digits']) {
						decimalPosition = textField[2]['min-fraction-digits'];
					}
				}
			}
		}
		return decimalPosition;
	};

	export const getTextFieldDataType = (
		map: Map,
		layerId: string,
		metadata: VectorTileMetadata,
		fieldName: string
	) => {
		const tilestats = metadata?.json?.tilestats;
		// console.log(JSON.stringify(tilestats, null, '\t'));
		if (tilestats) {
			const tileStatLayer = tilestats?.layers.find(
				(tileLayer: VectorLayerTileStatLayer) =>
					tileLayer.layer == getLayerStyle(map, layerId)['source-layer']
			);

			if (tileStatLayer) {
				const tileStatLayerAttribute: VectorLayerTileStatAttribute | undefined =
					tileStatLayer.attributes.find(
						(val: VectorLayerTileStatAttribute) => val.attribute === fieldName
					);

				if (tileStatLayerAttribute) {
					let atype = tileStatLayerAttribute.type;
					if (tileStatLayerAttribute.type === 'number') {
						if (tileStatLayerAttribute.values && tileStatLayerAttribute.values.length > 0) {
							tileStatLayerAttribute.values.forEach((val: number) => {
								atype = isInt(val) ? 'integer' : 'float';
							});
						} else if (tileStatLayerAttribute.min) {
							atype = isInt(tileStatLayerAttribute.min) ? 'integer' : 'float';
						} else {
							atype = 'integer';
						}
					}

					return atype;
				}
			}
		}
	};
</script>

<script lang="ts">
	import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper';
	import {
		isInt,
		MAPSTORE_CONTEXT_KEY,
		NumberInput,
		type MapStore,
		type VectorLayerTileStatAttribute,
		type VectorLayerTileStatLayer,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const propertyName = 'text-field';
	let style = getLayerStyle($map, layerId);
	let decimalPosition = getDecimalPosition($map, layerId);

	const setDecimalPosition = () => {
		const layer = $map.getLayer(layerId);
		if (!layer) return;
		if (['line', 'fill'].includes(layer.type)) return;
		style = getLayerStyle($map, layerId);
		const textFieldValue = getPropertyValueFromExpression(style, 'text-field');

		if (textFieldValue) {
			// let layer = getLayer();
			let fieldType = getTextFieldDataType($map, layerId, metadata, textFieldValue);
			let propertyValue: string[] | string[][] = ['get', textFieldValue];
			if (fieldType && ['number', 'float'].includes(fieldType)) {
				if (!decimalPosition) {
					decimalPosition = 1;
				}
				propertyValue = [
					'number-format',
					['get', textFieldValue],
					{ 'min-fraction-digits': decimalPosition, 'max-fraction-digits': decimalPosition }
				];
			} else if (fieldType && fieldType === 'integer') {
				propertyValue = [
					'number-format',
					['get', textFieldValue],
					{ 'min-fraction-digits': 0, 'max-fraction-digits': 0 }
				];
			}
			map.setLayoutProperty(layerId, propertyName, propertyValue);
		} else {
			map.setLayoutProperty(layerId, propertyName, undefined);
		}
	};

	const handleChanged = () => {
		setDecimalPosition();
		dispatch('change', {
			decimalPosition
		});
	};
</script>

<NumberInput
	bind:value={decimalPosition}
	minValue={1}
	maxValue={10}
	step={1}
	on:change={handleChanged}
/>
