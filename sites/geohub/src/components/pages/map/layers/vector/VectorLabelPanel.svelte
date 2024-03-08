<script lang="ts">
	import SymbolPlacement from '$components/maplibre/symbol/SymbolPlacement.svelte';
	import TextColor from '$components/maplibre/symbol/TextColor.svelte';
	import TextField from '$components/maplibre/symbol/TextField.svelte';
	import TextFieldDecimalPosition from '$components/maplibre/symbol/TextFieldDecimalPosition.svelte';
	import TextFont from '$components/maplibre/symbol/TextFont.svelte';
	import TextHaloColor from '$components/maplibre/symbol/TextHaloColor.svelte';
	import TextHaloWidth from '$components/maplibre/symbol/TextHaloWidth.svelte';
	import TextMaxWidth from '$components/maplibre/symbol/TextMaxWidth.svelte';
	import TextSize from '$components/maplibre/symbol/TextSize.svelte';
	import Accordion from '$components/util/Accordion.svelte';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL,
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		type MapStore
	} from '$stores';
	import { Help } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let metadata: VectorTileMetadata;

	let parentLayerId = layer.id;
	let style: LayerSpecification = getLayerStyle($map, layer.id);
	let textFieldValue = '';
	let onlyNumberFields = false;
	let targetLayer: Layer = style.type === 'symbol' ? layer : undefined;
	let targetLayerId = targetLayer ? layer.id : `${parentLayerId}-label`;

	onMount(() => {
		initialiseTextLabel();
	});

	const initialiseTextLabel = () => {
		if (!targetLayer) {
			layer.children?.forEach((child) => {
				if (child.parentId === layer.id) {
					targetLayer = child;
					targetLayerId = child.id;
				}
			});
		}
		if (style.type !== 'symbol') {
			targetLayer = {
				id: targetLayerId,
				name: targetLayerId,
				info: layer.info,
				parentId: layer.id,
				dataset: undefined
			};
		}
		const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
		textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout');
	};

	const fireLabelChanged = (e: { detail: { textFieldValue: string } }) => {
		textFieldValue = e.detail.textFieldValue;
	};

	let expanded: { [key: string]: boolean } = { 'text-field': true };
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}
</script>

{#if targetLayer}
	<div class="label-container">
		<Accordion title="Property" bind:isExpanded={expanded['text-field']}>
			<div class="pb-2" slot="content">
				<TextField bind:onlyNumberFields on:change={fireLabelChanged} bind:layer={targetLayer} />
			</div>
			<div slot="buttons">
				<Help>Select a property to show data label for a vector layer.</Help>
			</div>
		</Accordion>

		{#if textFieldValue && $map.getLayer(layer.id)}
			{@const fieldType = getTextFieldDataType($map, layer, textFieldValue)}

			<Accordion title="Font" bind:isExpanded={expanded['text-font']}>
				<div class="pb-2" slot="content">
					<TextFont bind:layerId={targetLayer.id} />
				</div>
				<div slot="buttons">
					<Help>The text font with which the text will be drawn.</Help>
				</div>
			</Accordion>

			<Accordion title="Font size" bind:isExpanded={expanded['text-size']}>
				<div class="pb-2" slot="content">
					<TextSize bind:layerId={targetLayer.id} />
				</div>
				<div slot="buttons">
					<Help>The font size with which the text will be drawn.</Help>
				</div>
			</Accordion>

			{#if fieldType && ['number', 'float'].includes(fieldType)}
				<Accordion title="Decimal position" bind:isExpanded={expanded['text-decimal-position']}>
					<div class="pb-2" slot="content">
						<TextFieldDecimalPosition bind:layerId={targetLayer.id} />
					</div>
					<div slot="buttons">
						<Help>
							The number of decimal places with which the numeric value label will be formated.
						</Help>
					</div>
				</Accordion>
			{/if}

			<Accordion title="Text color" bind:isExpanded={expanded['text-color']}>
				<div class="pb-2" slot="content">
					<TextColor
						bind:layerId={targetLayer.id}
						bind:metadata
						classesContextKey={NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL}
						colorContextKey={DEFAULTCOLOR_CONTEXT_KEY_LABEL}
						colormapContextKey={COLORMAP_NAME_CONTEXT_KEY_LABEL}
						classificationContextKey={CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL}
					/>
				</div>
				<div slot="buttons">
					<Help>Change text color by using single color or selected property.</Help>
				</div>
			</Accordion>

			<Accordion title="Text halo color" bind:isExpanded={expanded['text-halo-color']}>
				<div class="pb-2" slot="content">
					<TextHaloColor bind:layerId={targetLayer.id} />
				</div>
				<div slot="buttons">
					<Help>The color of the text's halo, which helps it stand out from backgrounds.</Help>
				</div>
			</Accordion>

			<Accordion title="Text halo width" bind:isExpanded={expanded['text-halo-width']}>
				<div class="pb-2" slot="content">
					<TextHaloWidth bind:layerId={targetLayer.id} />
				</div>
				<div slot="buttons">
					<Help>
						Distance of halo to the font outline. Max text halo width is 1/4 of the font-size.
					</Help>
				</div>
			</Accordion>

			{#if ['fill', 'line', 'fill-extrusion'].includes(style.type)}
				<Accordion
					title="Label position relative to geometry"
					bind:isExpanded={expanded['symbol-placement']}
				>
					<div class="pb-2" slot="content">
						<SymbolPlacement bind:layerId={targetLayer.id} bind:parentId={parentLayerId} />
					</div>
					<div slot="buttons">
						<Help>
							Label placement relative to its geometry.
							<br />
							<b>Point</b>: The label is placed at the point where the geometry is located.
							<br />
							<b>Line</b>: The label is placed along the line of the geometry. Can only be used on
							LineString and Polygon geometries.
							<br />
							<b>Line Center</b>: The label is placed at the center of the line of the geometry. Can
							only be used on LineString and Polygon geometries. Note that a single feature in a
							vector tile may contain multiple line geometries.
						</Help>
					</div>
				</Accordion>
			{/if}

			<Accordion title="Maximum width text wrap" bind:isExpanded={expanded['text-max-width']}>
				<div class="pb-2" slot="content">
					<TextMaxWidth bind:layerId={targetLayer.id} />
				</div>
				<div slot="buttons">
					<Help>The maximum line width for text wrapping.</Help>
				</div>
			</Accordion>
		{/if}
	</div>
{/if}
