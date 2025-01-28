<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import IconImage from './IconImage.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Symbol/IconImage',
		component: IconImage,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const apiOrigin = 'https://dev.undpgeohub.org';

	const title = 'Icon Image Control';

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
			'icon-image': 'circle',
			'icon-size': 3
		},
		paint: {}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<IconImage {...args}></IconImage>
	</Map>
{/snippet}

<Story
	name="Primary"
	args={{ layerId: layer.id, apiOrigin: apiOrigin }}
	tags={['autodocs']}
	children={template}
/>
