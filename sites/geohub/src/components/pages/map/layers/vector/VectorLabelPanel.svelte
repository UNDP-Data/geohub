<script lang="ts">
	import SymbolPlacement from '$components/maplibre/symbol/SymbolPlacement.svelte';
	import TextColor from '$components/maplibre/symbol/TextColor.svelte';
	import TextField from '$components/maplibre/symbol/TextField.svelte';
	import TextFieldDecimalPosition from '$components/maplibre/symbol/TextFieldDecimalPosition.svelte';
	import TextHaloCalor from '$components/maplibre/symbol/TextHaloColor.svelte';
	import TextHaloWidth from '$components/maplibre/symbol/TextHaloWidth.svelte';
	import TextMaxWidth from '$components/maplibre/symbol/TextMaxWidth.svelte';
	import TextSize from '$components/maplibre/symbol/TextSize.svelte';
	import { getLayerStyle, getPropertyValueFromExpression, getTextFieldDataType } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const parentLayerId = layer.id;
	let style: LayerSpecification = getLayerStyle($map, layer.id);
	let textFieldValue = '';
	let isAdvancedSettings = false;
	let inLegend = false;
	let targetLayer: Layer = style.type === 'symbol' ? layer : undefined;
	let targetLayerId = targetLayer ? layer.id : undefined;

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
		if (targetLayerId && !$map.getLayer(targetLayerId)) {
			if (!layer.children) {
				delete layer.children;
			}
		}

		if (style.type !== 'symbol') {
			if (targetLayer) {
				const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
				textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field');
			} else {
				targetLayerId = `${parentLayerId}-label`;
				const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
				textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field');

				if (!layer.children) {
					layer.children = [];
				}
				if (!layer.children.find((child) => child.id === targetLayerId)) {
					targetLayer = {
						id: targetLayerId,
						name: targetLayerId,
						info: layer.info,
						parentId: layer.id,
						dataset: undefined
					};
					layer.children = [targetLayer, ...layer.children];
				}
			}
		} else {
			const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
			textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout');
		}
	};

	const fireLabelChanged = (e: { detail: { textFieldValue: string } }) => {
		textFieldValue = e.detail.textFieldValue;
	};
</script>

{#if targetLayer}
	<div class="action" data-testid="vector-label-panel-container">
		<div class="columns is-mobile is-10 mb-0 is-vcentered is-justify-content-space-between">
			<div class="column is-3">Property:&nbsp;</div>
			<div class="column pl-0 pr-5 is-7">
				<TextField bind:inLegend on:change={fireLabelChanged} bind:layer={targetLayer} />
			</div>
		</div>
		{#if textFieldValue}
			{@const fieldType = getTextFieldDataType($map, layer, textFieldValue)}
			{#if fieldType && ['number', 'float'].includes(fieldType)}
				<div class="columns is-mobile is-12 m-auto is-vcentered">
					<div class="column is-8 pl-0">Number of decimal places</div>
					<div class="column is-3 is-flex is-justify-content-center">
						<TextFieldDecimalPosition bind:layerId={targetLayer.id} />
					</div>
				</div>
			{/if}

			<div class="columns is-mobile is-12 mb-0 pb-0 is-vcentered">
				<div class="column is-3 pr-0">Font color:</div>
				<div class="column pl-0 is-1">
					<TextColor bind:layer={targetLayer} />
				</div>
				<div class="column is-3 pl-4 pr-0">Font size:</div>
				<div class="column pl-0 is-5">
					<TextSize bind:layer={targetLayer} />
				</div>
			</div>
			<div class="columns is-mobile is-12 mb-0 pb-0 is-vcentered">
				<div class="column is-3 pr-0">Halo color:</div>
				<div class="column pl-0 is-1">
					<TextHaloCalor bind:layer={targetLayer} />
				</div>
				<div class="column is-3 pl-4 pr-0">Halo width:</div>
				<div class="column pl-0 is-5">
					<TextHaloWidth bind:layer={targetLayer} />
				</div>
			</div>

			<div class="columns is-mobile advanced-settings">
				<div class="column is-6 m-auto">
					<div class="field">
						<input
							id="switchAdvancedSettings-{layer.id}"
							type="checkbox"
							name="switchSmall-{layer.id}"
							class="switch is-small is-rounded is-info"
							bind:checked={isAdvancedSettings}
						/>
						<label for="switchAdvancedSettings-{layer.id}" class="is-size-6"
							>Advanced Settings</label
						>
					</div>
				</div>
			</div>

			{#if isAdvancedSettings}
				<div class="advanced-settings-container pb-4">
					<div class="columns is-mobile">
						{#if style.type === 'fill' || style.type === 'line'}
							<div class="column">
								<div class="has-text-centered pb-2">Label position relative to geometry</div>
								<div class="is-flex is-justify-content-center">
									<SymbolPlacement bind:layer={targetLayer} />
								</div>
							</div>
						{/if}

						<div class="column">
							<div class="has-text-centered">Maximum width text wrap</div>
							<div class="is-flex is-justify-content-center" style="position: relative;">
								<TextMaxWidth bind:layer={targetLayer} />
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	.advanced-settings-container {
		padding-left: 15px;
		padding-right: 15px;

		> .columns {
			border: 1px solid #ccc;
			padding: 0;
			padding-top: 5px;
		}
	}
</style>
