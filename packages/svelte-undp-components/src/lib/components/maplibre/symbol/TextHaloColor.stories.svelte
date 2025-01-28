<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import TextHaloColor from './TextHaloColor.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Symbol/TextHaloColor',
		component: TextHaloColor,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Text Halo Color Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: SymbolLayerSpecification = {
		id: 'text-example',
		type: 'symbol',
		source: 'carto',
		'source-layer': 'place',
		minzoom: 2,
		maxzoom: 7,
		filter: ['all', ['==', 'class', 'country'], ['<=', 'rank', 2]],
		layout: {
			'text-field': '{name_en}',
			'text-font': ['Proxima Nova Bold']
		},
		paint: { 'text-halo-width': 1, 'text-halo-color': 'rgba(255,0,0,1)' }
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<TextHaloColor {...args}></TextHaloColor>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} tags={['autodocs']} children={template} />
