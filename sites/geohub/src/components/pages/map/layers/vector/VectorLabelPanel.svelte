<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { page } from '$app/stores';
	import SymbolPlacement from '$components/maplibre/symbol/SymbolPlacement.svelte';
	import TextColor from '$components/maplibre/symbol/TextColor.svelte';
	import TextField from '$components/maplibre/symbol/TextField.svelte';
	import TextHaloCalor from '$components/maplibre/symbol/TextHaloCalor.svelte';
	import TextHaloWidth from '$components/maplibre/symbol/TextHaloWidth.svelte';
	import TextMaxWidth from '$components/maplibre/symbol/TextMaxWidth.svelte';
	import TextSize from '$components/maplibre/symbol/TextSize.svelte';
	import NumberFormat from '$components/util/NumberFormat.svelte';
	import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const parentLayerId = layer.id;
	let style: LayerSpecification = getLayerStyle($map, layer.id);
	let decimalPosition: number;
	let fieldType: string;
	let textFieldValue = '';
	let isAdvancedSettings = false;
	let inLegend = false;
	let targetLayer: Layer = style.type === 'symbol' ? layer : undefined;
	let targetLayerId = targetLayer ? layer.id : undefined;
	let updateLegend = () => undefined;
	let isLabelCreated = false;

	onMount(() => {
		initialiseTextLabel();
	});

	const initialiseTextLabel = () => {
		if (style.type !== 'symbol') {
			if (targetLayer?.children?.length > 0) {
				targetLayer = targetLayer.children[0];
				targetLayerId = targetLayer.id;

				const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
				textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout');
				fireLabelChanged();
			} else {
				targetLayerId = `${parentLayerId}-label`;

				if (!layer.children) {
					layer.children = [];
				}

				targetLayer = {
					id: targetLayerId,
					name: targetLayerId,
					info: layer.info,
					parentId: layer.id,
					dataset: undefined
				};
				layer.children = [targetLayer, ...layer.children];
			}
		} else {
			const textSize = $map.getLayoutProperty(targetLayerId, 'text-size');
			const textMaxWidth = $map.getLayoutProperty(targetLayerId, 'text-max-width');
			const textColor: string = $map.getPaintProperty(targetLayerId, 'text-color') as string;
			const textHaloColor: string = $map.getPaintProperty(
				targetLayerId,
				'text-halo-color'
			) as string;
			const textHaloWidth: number = $map.getPaintProperty(
				targetLayerId,
				'text-halo-width'
			) as number;

			map.setLayoutProperty(
				targetLayerId,
				'text-size',
				textSize ?? $page.data.config.LabelFontSize
			);
			map.setLayoutProperty(targetLayerId, 'text-max-width', textMaxWidth ?? 10);
			map.setPaintProperty(targetLayerId, 'text-color', textColor ?? 'rgba(0,0,0,1)');
			map.setPaintProperty(
				targetLayerId,
				'text-halo-color',
				textHaloColor ?? 'rgba(255,255,255,1)'
			);
			map.setPaintProperty(
				targetLayerId,
				'text-halo-width',
				textHaloWidth ?? $page.data.config.LabelHaloWidth
			);

			const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId);
			textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout');
			fireLabelChanged();
		}
	};

	const onStyleChange = () => {
		updateLegend();
	};

	const fireLabelChanged = () => {
		isLabelCreated = !!textFieldValue;
		$map.fire('label:changed', {
			parentId: parentLayerId,
			layerId: targetLayer.id,
			isCreated: isLabelCreated
		});
	};
</script>

{#if targetLayer}
	<div class="action" data-testid="vector-label-panel-container">
		<div class="columns is-mobile is-10 mb-0 is-vcentered is-justify-content-space-between">
			<div class="column is-3">Property:&nbsp;</div>
			<div class="column pl-0 pr-5 is-7">
				<TextField
					bind:inLegend
					on:change={fireLabelChanged}
					bind:layer={targetLayer}
					bind:fieldType
					bind:textFieldValue
					bind:decimalPosition
				/>
			</div>
		</div>
		{#if isLabelCreated}
			{#if fieldType && ['number', 'float'].includes(fieldType)}
				<div class="columns is-mobile is-12 m-auto is-vcentered" transition:fade|global>
					<div class="column is-8 pl-0">Number of decimal places</div>
					<div class="column is-3 is-flex is-justify-content-center">
						<NumberFormat on:change={onStyleChange} bind:decimalPosition />
					</div>
				</div>
			{/if}
			<div class="columns is-mobile is-12 mb-0 pb-0 is-vcentered">
				<div class="column is-3 pr-0">Font color:</div>
				<div class="column pl-0 is-1">
					<TextColor on:change={onStyleChange} bind:layerId={targetLayer.id} />
				</div>
				<div class="column is-3 pl-4 pr-0">Font size:</div>
				<div class="column pl-0 is-5">
					<TextSize on:change={onStyleChange} bind:layerId={targetLayer.id} />
				</div>
			</div>
			<div class="columns is-mobile is-12 mb-0 pb-0 is-vcentered">
				<div class="column is-3 pr-0">Halo color:</div>
				<div class="column pl-0 is-1">
					<TextHaloCalor on:change={onStyleChange} bind:layerId={targetLayer.id} />
				</div>
				<div class="column is-3 pl-4 pr-0">Halo width:</div>
				<div class="column pl-0 is-5">
					<TextHaloWidth on:change={onStyleChange} bind:layerId={targetLayer.id} />
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
									<SymbolPlacement on:change={onStyleChange} bind:layerId={targetLayer.id} />
								</div>
							</div>
						{/if}

						<div class="column">
							<div class="has-text-centered">Maximum width text wrap</div>
							<div class="is-flex is-justify-content-center" style="position: relative;">
								<TextMaxWidth on:change={onStyleChange} bind:layerId={targetLayer.id} />
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
