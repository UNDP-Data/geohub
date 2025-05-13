<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterSaturation from './RasterSaturation.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterSaturation',
		component: RasterSaturation,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Saturation Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterSaturation {...args}></RasterSaturation>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} {template} />
