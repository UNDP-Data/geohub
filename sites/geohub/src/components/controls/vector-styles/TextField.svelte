<script lang="ts">
	import type { SymbolLayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	import { page } from '$app/stores';
	import { FontJsonUrl } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper';
	import type { Layer, VectorLayerTileStatAttribute, VectorLayerTileStatLayer } from '$lib/types';
	import { map } from '$stores';
	import PropertySelect from './PropertySelect.svelte';

	let config: UserConfig = $page.data.config;

	export let layer: Layer;
	export let decimalPosition = undefined;
	export let fieldType: string = undefined;
	export let textFieldValue: string = undefined;
	export let inLegend: boolean;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const propertyName = 'text-field';

	let style = getLayerStyle($map, layer.id);
	let showEmptyFields = true;

	onMount(() => {
		getTextField();
		setTextField();
	});

	$: decimalPosition, setDesimalPosition();
	const setDesimalPosition = () => {
		if (!$map) return;
		if (!$map.getLayer(layerId)) return;
		if (['line', 'fill'].includes($map.getLayer(layerId).type)) return;
		if (textFieldValue) {
			fieldType = getFieldDataType(textFieldValue);
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

	const isInt = (n: number) => {
		return Number(n) === n && n % 1 === 0;
	};

	const getFieldDataType = (fieldName: string) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const tilestats = layer?.info?.json?.tilestats;
		if (tilestats) {
			const tileStatLayer = tilestats?.layers.find(
				(tileLayer: VectorLayerTileStatLayer) =>
					tileLayer.layer == getLayerStyle($map, layer.id)['source-layer']
			);
			if (tileStatLayer) {
				const tileStatLayerAttribute = tileStatLayer.attributes.find(
					(val: VectorLayerTileStatAttribute) => val.attribute === fieldName
				);
				if (tileStatLayerAttribute) {
					let type = tileStatLayerAttribute.type;
					if (tileStatLayerAttribute.type === 'number') {
						if (tileStatLayerAttribute.values && tileStatLayerAttribute.values.length > 0) {
							tileStatLayerAttribute.values.forEach((val: number) => {
								type = isInt(val) ? 'interger' : 'float';
							});
						} else if (tileStatLayerAttribute.min) {
							type = isInt(tileStatLayerAttribute.min) ? 'interger' : 'float';
						} else {
							type = 'integer';
						}
					}
					return type;
				}
			}
		}
	};

	const getTextField = () => {
		// get label text field
		const textField = getPropertyValueFromExpression(style, 'text-field');
		if (textField) {
			if (Array.isArray(textField)) {
				if (textField[0] === 'get') {
					textFieldValue = textField[1];
				} else if (textField[0] === 'number-format') {
					textFieldValue = textField[1][1];
					if (textField[2]['min-fraction-digits'] === textField[2]['max-fraction-digits']) {
						decimalPosition = textField[2]['min-fraction-digits'];
					}
				}
			} else {
				textFieldValue = textField;
			}
		}
	};
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
			setDesimalPosition();
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
