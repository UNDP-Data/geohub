<script lang="ts">
	import { page } from '$app/stores';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import { FontJsonUrl } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import type { SymbolLayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { getDecimalPosition } from './TextFieldDecimalPosition.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	let config: UserConfig = $page.data.config;

	export let layer: Layer;
	export let onlyNumberFields: boolean;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const propertyName = 'text-field';
	let textFieldValue: string = undefined;
	let metadata = layer.info as VectorTileMetadata;

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
					'text-halo-width': Number(config.LabelHaloWidth)
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
			let propertyValue: unknown = ['get', textFieldValue];
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

			if (layer.parentId) {
				const parentLayer = $layerListStore.find((l) => l.id === layer.parentId);
				if (parentLayer) {
					if (!parentLayer.children) {
						parentLayer.children = [];
					}
					if (!parentLayer.children.find((child) => child.id === layerId)) {
						parentLayer.children = [layer];
						$layerListStore = [...$layerListStore];
					}
				}
			}
		} else {
			if (layer.parentId) {
				if ($map.getLayer(layerId)) {
					$map.removeLayer(layerId);
				}
				const parentLayer = $layerListStore.find((l) => l.id === layer.parentId);
				if (parentLayer) {
					delete parentLayer.children;
					$layerListStore = [...$layerListStore];
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
	bind:onlyNumberFields
	bind:showEmptyFields
	bind:propertySelectValue={textFieldValue}
	{layerId}
	parentId={layer.parentId}
	{metadata}
	on:select={setTextField}
/>
