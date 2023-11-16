<script lang="ts">
	import TextColor from '$components/maplibre/symbol/TextColor.svelte';
	import TextField from '$components/maplibre/symbol/TextField.svelte';
	import TextFieldDecimalPosition from '$components/maplibre/symbol/TextFieldDecimalPosition.svelte';
	import TextFont from '$components/maplibre/symbol/TextFont.svelte';
	import TextSize from '$components/maplibre/symbol/TextSize.svelte';
	import VectorLabelPropertyEditor from '$components/maplibre/vector/VectorLabelPropertyEditor.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import {
		getLayerStyle,
		getPropertyValueFromExpression,
		getTextFieldDataType,
		handleEnterKey
	} from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import {
		COLORMAP_NAME_CONTEXT_KEY_LABEL,
		DEFAULTCOLOR_CONTEXT_KEY_LABEL,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL,
		type MapStore
	} from '$stores';
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

	let tabs = [
		{
			label: 'general',
			icon: 'fa-solid fa-gear'
		},
		{
			label: 'color',
			icon: 'fa-solid fa-fill'
		}
	];
	let activeTab: string = tabs[0].label;

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

			<div class="tabs is-centered is-toggle">
				<ul>
					{#each tabs as tab}
						<li class={activeTab === tab.label ? 'is-active' : ''}>
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								class="has-text-weight-bold"
								role="tab"
								tabindex="0"
								data-sveltekit-preload-code="off"
								data-sveltekit-preload-data="off"
								on:click={() => {
									activeTab = tab.label;
								}}
								on:keydown={handleEnterKey}
							>
								<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
								<span class="is-capitalized">{tab.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div hidden={activeTab !== tabs[0].label}>
				<FieldControl title="Font">
					<div slot="help">The text font with which the text will be drawn.</div>
					<div slot="control"><TextFont bind:layerId={targetLayer.id} /></div>
				</FieldControl>

				<div class="grid">
					<FieldControl title="Font size">
						<div slot="help">The font size with which the text will be drawn.</div>
						<div slot="control"><TextSize bind:layerId={targetLayer.id} /></div>
					</FieldControl>

					{#if fieldType && ['number', 'float'].includes(fieldType)}
						<FieldControl title="Decimal position">
							<div slot="help">
								The number of decimal places with which the numeric value label will be formated.
							</div>
							<div slot="control"><TextFieldDecimalPosition bind:layerId={targetLayer.id} /></div>
						</FieldControl>
					{/if}
				</div>
			</div>

			<div hidden={activeTab !== tabs[1].label}>
				<TextColor
					bind:layerId={targetLayer.id}
					bind:metadata
					classesContextKey={NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL}
					colorContextKey={DEFAULTCOLOR_CONTEXT_KEY_LABEL}
					colormapContextKey={COLORMAP_NAME_CONTEXT_KEY_LABEL}
				/>
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
