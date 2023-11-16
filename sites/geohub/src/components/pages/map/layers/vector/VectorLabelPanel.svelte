<script lang="ts">
	import TextColor from '$components/maplibre/symbol/TextColor.svelte';
	import TextField from '$components/maplibre/symbol/TextField.svelte';
	import TextFieldDecimalPosition from '$components/maplibre/symbol/TextFieldDecimalPosition.svelte';
	import TextSize from '$components/maplibre/symbol/TextSize.svelte';
	import VectorLabelPropertyEditor from '$components/maplibre/vector/VectorLabelPropertyEditor.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

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
</script>

{#if targetLayer}
	<div class="label-container py-2">
		{#if textFieldValue && $map.getLayer(layer.id)}
			<div class="editor-button">
				<VectorLabelPropertyEditor bind:layerId={targetLayer.id} bind:parentId={parentLayerId} />
			</div>
		{/if}

		<FieldControl title="Property">
			<div slot="help">Select a property to show data label for a vector layer.</div>
			<div slot="control">
				<TextField bind:onlyNumberFields on:change={fireLabelChanged} bind:layer={targetLayer} />
			</div>
		</FieldControl>

		{#if textFieldValue && $map.getLayer(layer.id)}
			{@const fieldType = getTextFieldDataType($map, layer, textFieldValue)}
			{#if fieldType && ['number', 'float'].includes(fieldType)}
				<FieldControl title="Number of decimal places">
					<div slot="help">
						The number of decimal places with which the numeric value label will be formated.
					</div>
					<div slot="control"><TextFieldDecimalPosition bind:layerId={targetLayer.id} /></div>
				</FieldControl>
			{/if}

			<div class="grid">
				<FieldControl title="Font color">
					<div slot="help">The color with which the text will be drawn.</div>
					<div slot="control"><TextColor bind:layerId={targetLayer.id} /></div>
				</FieldControl>

				<FieldControl title="Font size">
					<div slot="help">The font size with which the text will be drawn.</div>
					<div slot="control"><TextSize bind:layerId={targetLayer.id} /></div>
				</FieldControl>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.label-container {
		position: relative;

		.editor-button {
			position: absolute;
			top: 0em;
			right: 0em;
			z-index: 10;
		}

		.grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}
	}
</style>
