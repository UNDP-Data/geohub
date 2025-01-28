<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import IconOverlap from './IconOverlap.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Symbol/IconOverlap',
		component: IconOverlap,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Icon Overlap Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: SymbolLayerSpecification = {
		id: 'symbol-example',
		type: 'symbol',
		source: 'carto',
		'source-layer': 'place',
		layout: {
			'icon-image': 'circle'
		},
		paint: {}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<IconOverlap {...args}></IconOverlap>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} tags={['autodocs']} children={template} />
