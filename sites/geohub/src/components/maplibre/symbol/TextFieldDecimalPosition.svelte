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
</script>

<script lang="ts">
	import NumberFormat from '$components/util/NumberFormat.svelte';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	export let layerId: string;

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
			let layer = getLayer();
			let fieldType = getTextFieldDataType($map, layer, textFieldValue);
			let propertyValue = ['get', textFieldValue];
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

	const getLayer = () => {
		let layer: Layer = $layerListStore.find((l) => l.id === layerId);
		if (!layer) {
			for (const l of $layerListStore) {
				layer = l.children?.find((child) => child.id === layerId);
				if (layer) {
					break;
				}
			}
		}
		return layer;
	};

	const handleChanged = () => {
		setDecimalPosition();
		dispatch('change', {
			decimalPosition
		});
	};
</script>

<NumberFormat on:change={handleChanged} bind:decimalPosition />
