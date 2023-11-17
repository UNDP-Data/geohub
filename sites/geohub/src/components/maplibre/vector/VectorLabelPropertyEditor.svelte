<script lang="ts">
	import OptionalPropertyEditor from '$components/maplibre/OptionalPropertyEditor.svelte';
	import SymbolPlacement from '$components/maplibre/symbol/SymbolPlacement.svelte';
	import TextHaloColor from '$components/maplibre/symbol/TextHaloColor.svelte';
	import TextHaloWidth from '$components/maplibre/symbol/TextHaloWidth.svelte';
	import TextMaxWidth from '$components/maplibre/symbol/TextMaxWidth.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorLayerSpecification } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let parentId: string;

	const style: VectorLayerSpecification = $map.getStyle().layers.find((l: LayerSpecification) => {
		if (parentId) {
			return l.id === parentId;
		} else {
			return l.id === layerId;
		}
	}) as VectorLayerSpecification;

	let expanded: { [key: string]: boolean } = {
		Label: true
	};
</script>

<OptionalPropertyEditor>
	<Accordion headerTitle="Label" fontSize="medium" bind:isExpanded={expanded['Label']}>
		<div class="pb-2" slot="content">
			<p class="py-2">You can adjust label visulasization parameters.</p>

			<FieldControl title="Text halo color">
				<div slot="help">
					The color of the text's halo, which helps it stand out from backgrounds.
				</div>
				<div slot="control"><TextHaloColor bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Text halo width">
				<div slot="help">
					Distance of halo to the font outline. Max text halo width is 1/4 of the font-size.
				</div>
				<div slot="control"><TextHaloWidth bind:layerId /></div>
			</FieldControl>

			{#if ['fill', 'line', 'fill-extrusion'].includes(style.type)}
				<FieldControl title="Label position relative to geometry">
					<div slot="help">
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
					</div>
					<div slot="control"><SymbolPlacement bind:layerId bind:parentId /></div>
				</FieldControl>
			{/if}

			<FieldControl title="Maximum width text wrap">
				<div slot="help">The maximum line width for text wrapping.</div>
				<div slot="control"><TextMaxWidth bind:layerId /></div>
			</FieldControl>
		</div>
	</Accordion>
</OptionalPropertyEditor>
