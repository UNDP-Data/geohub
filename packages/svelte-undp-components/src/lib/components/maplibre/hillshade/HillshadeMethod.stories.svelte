<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { HillshadeLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import HillshadeMethod from './HillshadeMethod.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Hillshade/HillshadeMethod',
		component: HillshadeMethod,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			},
			defaultValue: {
				type: 'string',
				description: 'Default value for the hillshade method. Default is "standard".'
			}
		}
	});

	const title = 'Hillshade Method Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: HillshadeLayerSpecification = {
		id: 'hillshade-example',
		type: 'hillshade',
		source: 'terrarium',
		layout: {},
		paint: {
			'hillshade-shadow-color': 'hsl(39, 21%, 33%)',
			'hillshade-illumination-direction': 315,
			'hillshade-exaggeration': 1.0,
			'hillshade-method': 'standard'
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<HillshadeMethod {...args}></HillshadeMethod>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id, defaultValue: 'standard' }} {template} />
