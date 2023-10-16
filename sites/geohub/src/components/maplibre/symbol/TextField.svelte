<script lang="ts">
	import { page } from '$app/stores';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import { FontJsonUrl } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { SymbolLayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { getDecimalPosition } from './TextFieldDecimalPosition.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	let config: UserConfig = $page.data.config;

	export let layer: Layer;
	export let textFieldValue: string = undefined;
	export let inLegend: boolean;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const propertyName = 'text-field';

	let style = getLayerStyle($map, layer.id);
	let showEmptyFields = true;

	onMount(() => {
		textFieldValue = getPropertyValueFromExpression(style, propertyName);
		// setTextField();
	});

	const setTextField = () => {
		if (!style && !textFieldValue) return;
		if (!style && layer.parentId) {
			const parentStyle = getLayerStyle($map, layer.parentId);
			const childLayer: SymbolLayerSpecification = {
				id: layerId,
				type: 'symbol',
				source: parentStyle['source'],
				'source-layer': parentStyle['source-layer'],
				layout: {
					visibility: 'visible',
					'text-size': config.LabelFontSize,
					'text-max-width': 10
				},
				paint: {
					'text-color': 'rgba(0,0,0,1)',
					'text-halo-color': 'rgba(255,255,255,1)',
					'text-halo-width': config.LabelHaloWidth
				}
			};
			if (parentStyle.minzoom) {
				childLayer.minzoom = parentStyle.minzoom;
			}
			if (parentStyle.maxzoom) {
				childLayer.maxzoom = parentStyle.maxzoom;
			}
			style = childLayer;
		}

		if (style.type !== 'symbol') return;
		if (textFieldValue) {
			// variable label placement settings: https://docs.mapbox.com/mapbox-gl-js/example/variable-label-placement/
			style.layout['text-variable-anchor'] = ['top', 'bottom', 'left', 'right'];
			style.layout['text-radial-offset'] = 0.5;
			style.layout['text-justify'] = 'auto';

			const glyph = $map.getStyle().glyphs;
			if (glyph.startsWith(new URL(FontJsonUrl).origin)) {
				const exists = $map.getLayer(layerId);
				let textFont = exists
					? ($map.getLayoutProperty(layerId, 'text-font') as string[])
					: undefined;
				if (!(textFont && textFont.length > 0)) {
					textFont = [config.LabelTextFont];
				}

				style.layout['text-font'] = textFont;
			}

			if (!$map.getLayer(layerId)) {
				$map.addLayer(style);
			} else {
				map.setLayoutProperty(
					layerId,
					'text-variable-anchor',
					style.layout['text-variable-anchor']
				);
				map.setLayoutProperty(layerId, 'text-radial-offset', style.layout['text-radial-offset']);
				map.setLayoutProperty(layerId, 'text-justify', style.layout['text-justify']);
				if (style.layout['text-font']) {
					map.setLayoutProperty(layerId, 'text-font', style.layout['text-font']);
				}
			}

			let fieldType = getTextFieldDataType($map, layer, textFieldValue);
			let propertyValue = ['get', textFieldValue];
			if (fieldType && ['number', 'float'].includes(fieldType)) {
				const decimalPosition = getDecimalPosition($map, layerId);
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
			if (layer.parentId) {
				if ($map.getLayer(layerId)) {
					$map.removeLayer(layerId);
				}
			} else {
				map.setLayoutProperty(layerId, propertyName, undefined);
				map.setLayoutProperty(layerId, 'text-variable-anchor', undefined);
				map.setLayoutProperty(layerId, 'text-radial-offset', undefined);
				map.setLayoutProperty(layerId, 'text-justify', undefined);
				map.setLayoutProperty(layerId, 'text-font', undefined);
			}
		}
		dispatch('change', {
			textFieldValue
		});
	};
</script>

<PropertySelect
	bind:inLegend
	bind:showEmptyFields
	bind:propertySelectValue={textFieldValue}
	{layer}
	on:select={setTextField}
/>
