<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FillExtrusionLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import FillExtrusionBase from './FillExtrusionBase.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/FillExtrusion/FillExtrusionBase',
		component: FillExtrusionBase,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Fill Extrusion Base Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: FillExtrusionLayerSpecification = {
		id: 'fill-extrusion-example',
		type: 'fill-extrusion',
		source: 'carto',
		'source-layer': 'building',
		layout: {},
		paint: {
			'fill-extrusion-color': '#e4dcd0',
			'fill-extrusion-base': 50,
			'fill-extrusion-height': 100
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer} zoom={15} center={[139.80244, 35.6418]} pitch={85} bearing={90}>
		<FillExtrusionBase {...args}></FillExtrusionBase>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} children={template} />
