<script lang="ts">
	import { page } from '$app/state';
	import { FontJsonUrl } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { LAYERLISTSTORE_CONTEXT_KEY, type LayerListStore } from '$stores';
	import {
		MAPSTORE_CONTEXT_KEY,
		type MapStore,
		PropertySelect,
		type VectorTileMetadata,
		getDecimalPosition,
		getTextFieldDataType
	} from '@undp-data/svelte-undp-components';
	import type { SymbolLayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	let config: UserConfig = page.data.config;

	interface Props {
		layer: Layer;
		onlyNumberFields: boolean;
		onchange: (textFieldValue: string) => void;
	}

	let {
		layer = $bindable(),
		onlyNumberFields = $bindable(),
		onchange = (textFieldValue) => {
			console.log(textFieldValue);
		}
	}: Props = $props();

	const layerId = layer.id;
	const propertyName = 'text-field';
	let textFieldValue: string = $state('');
	let metadata = layer.info as VectorTileMetadata;

	let style = getLayerStyle($map, layer.id);
	let showEmptyFields = $state(true);

	onMount(() => {
		textFieldValue = getPropertyValueFromExpression(style, propertyName);
		// setTextField();
	});

	const setTextField = () => {
		if (!style && !textFieldValue) return;
		if (layer.parentId) {
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

			if (parentStyle.filter) {
				childLayer.filter = parentStyle.filter;
			}
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
			style.layout['text-radial-offset'] = 1;
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

				map.setPaintProperty(layerId, 'text-color', 'rgba(0,0,0,1)');
				map.setPaintProperty(layerId, 'text-halo-color', 'rgba(255,255,255,1)');
				map.setPaintProperty(layerId, 'text-halo-width', Number(config.LabelHaloWidth));
			}

			let fieldType = getTextFieldDataType(
				$map,
				layer.id,
				layer.info as VectorTileMetadata,
				textFieldValue
			);
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
				map.setLayoutProperty(layerId, 'text-size', undefined);
				map.setLayoutProperty(layerId, 'text-max-width', undefined);
				map.setPaintProperty(layerId, 'text-color', undefined);
				map.setPaintProperty(layerId, 'text-halo-color', undefined);
				map.setPaintProperty(layerId, 'text-halo-width', undefined);
			}
		}
		if (onchange) {
			onchange(textFieldValue);
		}
	};
</script>

<PropertySelect
	bind:onlyNumberFields
	bind:showEmptyFields
	bind:propertySelectValue={textFieldValue}
	{layerId}
	parentId={layer.parentId}
	{metadata}
	onselect={setTextField}
/>
