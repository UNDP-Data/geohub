<script lang="ts">
	import { page } from '$app/state';
	import TextField from '$components/pages/map/layers/vector/TextField.svelte';
	import {
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints,
		UniqueValueThreshold
	} from '$lib/config/AppConfig';
	import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL,
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type DefaultColorStore,
		type NumberOfClassesStore
	} from '$stores';
	import {
		Accordion,
		getTextFieldDataType,
		Help,
		MAPSTORE_CONTEXT_KEY,
		SymbolPlacement,
		TextFieldDecimalPosition,
		TextFont,
		TextHaloColor,
		TextHaloWidth,
		TextMaxWidth,
		TextSize,
		VectorColorClassification,
		type MapStore,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY_LABEL);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY_LABEL);
	const numberOfClassesStore: NumberOfClassesStore = getContext(
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL
	);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL
	);

	interface Props {
		layer: Layer;
		metadata: VectorTileMetadata;
	}

	let { layer = $bindable(), metadata = $bindable() }: Props = $props();

	let parentLayerId = $state(layer.id);
	let style: LayerSpecification = getLayerStyle($map, layer.id);
	let textFieldValue = $state('');
	let onlyNumberFields = $state(false);
	let targetLayer: Layer | undefined = $state(undefined);

	const fireLabelChanged = (value: string) => {
		textFieldValue = value;
	};

	let expanded: { [key: string]: boolean } = $state({});
	// to allow only an accordion to be expanded
	let expandedId: string = $state('');
	$effect(() => {
		let expandedData = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedData.length > 0) {
			expandedId = expandedData[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedData[0]] = true;
		}
	});

	onMount(() => {
		targetLayer = style.type === 'symbol' ? layer : undefined;
		let targetLayerId = targetLayer ? layer.id : `${parentLayerId}-label`;
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
		if (targetStyle) {
			textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout');
		}

		expanded['text-field'] = true;
	});
</script>

{#if expanded && targetLayer}
	<div class="label-container">
		<Accordion title="Property" bind:isExpanded={expanded['text-field']}>
			{#snippet content()}
				<div class="pb-2">
					<TextField
						bind:onlyNumberFields
						onchange={fireLabelChanged}
						bind:layer={targetLayer as Layer}
					/>
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Select a property to show data label for a vector layer.</Help>
				</div>
			{/snippet}
		</Accordion>

		{#if textFieldValue && $map.getLayer(layer.id)}
			{@const fieldType = getTextFieldDataType($map, layer.id, metadata, textFieldValue)}

			<Accordion title="Font" bind:isExpanded={expanded['text-font']}>
				{#snippet content()}
					<div class="pb-2">
						<TextFont bind:layerId={targetLayer.id} />
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>The text font with which the text will be drawn.</Help>
					</div>
				{/snippet}
			</Accordion>

			<Accordion title="Font size" bind:isExpanded={expanded['text-size']}>
				{#snippet content()}
					<div class="pb-2">
						<TextSize bind:layerId={targetLayer.id} defaultSize={page.data.config.LabelFontSize} />
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>The font size with which the text will be drawn.</Help>
					</div>
				{/snippet}
			</Accordion>

			{#if fieldType && ['number', 'float'].includes(fieldType)}
				<Accordion title="Decimal position" bind:isExpanded={expanded['text-decimal-position']}>
					{#snippet content()}
						<div class="pb-2">
							<TextFieldDecimalPosition bind:layerId={targetLayer.id} bind:metadata />
						</div>
					{/snippet}
					{#snippet buttons()}
						<div>
							<Help>
								The number of decimal places with which the numeric value label will be formated.
							</Help>
						</div>
					{/snippet}
				</Accordion>
			{/if}

			<Accordion title="Text color" bind:isExpanded={expanded['text-color']}>
				{#snippet content()}
					<div class="pb-2">
						<VectorColorClassification
							bind:layerId={targetLayer.id}
							bind:metadata
							propertyName="text-color"
							onlyNumberFields={false}
							bind:numberOfClasses={$numberOfClassesStore}
							numberOfClassesMinimum={NumberOfClassesMinimum}
							numberOfClassesMaximum={NumberOfClassesMaximum}
							defaultNumberOfClasses={page.data.config.NumberOfClasses}
							bind:classificationMethod={$classificationMethodStore}
							numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
							uniqueValueThreshold={UniqueValueThreshold}
							bind:colorMapName={$colorMapNameStore}
							bind:defaultColor={$defaultColorStore}
						/>
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>Change text color by using single color or selected property.</Help>
					</div>
				{/snippet}
			</Accordion>

			<Accordion title="Text halo color" bind:isExpanded={expanded['text-halo-color']}>
				{#snippet content()}
					<div class="pb-2">
						<TextHaloColor bind:layerId={targetLayer.id} />
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>The color of the text's halo, which helps it stand out from backgrounds.</Help>
					</div>
				{/snippet}
			</Accordion>

			<Accordion title="Text halo width" bind:isExpanded={expanded['text-halo-width']}>
				{#snippet content()}
					<div class="pb-2">
						<TextHaloWidth
							bind:layerId={targetLayer.id}
							defaultHaloWidth={page.data.config.LabelHaloWidth}
						/>
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>
							Distance of halo to the font outline. Max text halo width is 1/4 of the font-size.
						</Help>
					</div>
				{/snippet}
			</Accordion>

			{#if ['fill', 'line', 'fill-extrusion'].includes(style.type)}
				<Accordion
					title="Label position relative to geometry"
					bind:isExpanded={expanded['symbol-placement']}
				>
					{#snippet content()}
						<div class="pb-2">
							<SymbolPlacement bind:layerId={targetLayer.id} bind:parentId={parentLayerId} />
						</div>
					{/snippet}
					{#snippet buttons()}
						<div>
							<Help>
								Label placement relative to its geometry.
								<br />
								<b>Point</b>: The label is placed at the point where the geometry is located.
								<br />
								<b>Line</b>: The label is placed along the line of the geometry. Can only be used on
								LineString and Polygon geometries.
								<br />
								<b>Line Center</b>: The label is placed at the center of the line of the geometry.
								Can only be used on LineString and Polygon geometries. Note that a single feature in
								a vector tile may contain multiple line geometries.
							</Help>
						</div>
					{/snippet}
				</Accordion>
			{/if}

			<Accordion title="Maximum width text wrap" bind:isExpanded={expanded['text-max-width']}>
				{#snippet content()}
					<div class="pb-2">
						<TextMaxWidth bind:layerId={targetLayer.id} />
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>The maximum line width for text wrapping.</Help>
					</div>
				{/snippet}
			</Accordion>
		{/if}
	</div>
{/if}
