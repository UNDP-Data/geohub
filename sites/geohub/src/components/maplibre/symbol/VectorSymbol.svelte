<script lang="ts">
	import ClassificationMethodSelect from '$components/maplibre/ClassificationMethodSelect.svelte';
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import IconOverlap from '$components/maplibre/symbol/IconOverlap.svelte';
	import IconSize from '$components/maplibre/symbol/IconSize.svelte';
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import Help from '$components/util/Help.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'icon-color');
		if (color && ['interval', 'categorical'].includes(color['type'])) {
			isSimpleLegend = false;
		} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
			isSimpleLegend = false;
		} else {
			isSimpleLegend = true;
		}
	});

	let expanded: { [key: string]: boolean } = { icon: true };
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

{#if !$legendReadonly}
	<Accordion headerTitle="Icon" fontSize="medium" bind:isExpanded={expanded['icon']}>
		<div class="pb-2 pl-2" slot="content">
			<IconImage {layerId} bind:readonly={$legendReadonly} />
		</div>
		<div slot="button">
			<Help>Change icon for a vector layer.</Help>
		</div>
	</Accordion>

	<Accordion headerTitle="Icon color" fontSize="medium" bind:isExpanded={expanded['icon-color']}>
		<div class="pb-2" slot="content">
			<IconColor {layerId} {metadata} />
		</div>
		<div slot="button">
			<Help>Change icon color by using single color or selected property.</Help>
		</div>
	</Accordion>

	<Accordion headerTitle="Icon size" fontSize="medium" bind:isExpanded={expanded['icon-size']}>
		<div class="pb-2" slot="content">
			<IconSize {layerId} {metadata} />
		</div>
		<div slot="button">
			<Help>Change icon color by using single color or selected property.</Help>
		</div>
	</Accordion>

	<Accordion
		headerTitle="Overlap priority"
		fontSize="medium"
		bind:isExpanded={expanded['icon-overlap']}
	>
		<div class="pb-2" slot="content">
			<IconOverlap {layerId} />
		</div>
		<div slot="button">
			<Help>
				Allows for control over whether to show an icon when it overlaps other symbols on the map.
				<br />
				<b>never</b>: The icon will be hidden if it collides with any other previously drawn symbol.
				<br />
				<b>always</b>: The icon will be visible even if it collides with any other previously drawn
				symbol.
				<br />
				<b>cooperative</b>: If the icon collides with another previously drawn symbol, the overlap
				mode for that symbol is checked. If the previous symbol was placed using never overlap mode,
				the new icon is hidden. If the previous symbol was placed using always or cooperative
				overlap mode, the new icon is visible.
			</Help>
		</div>
	</Accordion>

	<Accordion headerTitle="Opacity" fontSize="medium" bind:isExpanded={expanded['opacity']}>
		<div class="pb-2" slot="content">
			<OpacitySlider bind:layerId />
		</div>
		<div slot="button">
			<Help>The opacity at which the image will be drawn.</Help>
		</div>
	</Accordion>

	<Accordion
		headerTitle="Classification method"
		fontSize="medium"
		bind:isExpanded={expanded['classification-method']}
	>
		<div class="pb-2" slot="content">
			<ClassificationMethodSelect />
		</div>
		<div slot="button">
			<Help
				>Whether to apply a classification method for a vector layer in selected property. This
				setting is only used when you select a property to classify the layer appearance.
			</Help>
		</div>
	</Accordion>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<IconColor {layerId} {metadata} />
{/if}
