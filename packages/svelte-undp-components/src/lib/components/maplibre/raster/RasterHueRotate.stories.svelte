<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterHueRotate from './RasterHueRotate.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterHueRotate',
		component: RasterHueRotate,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Hue Rotate Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterHueRotate {...args}></RasterHueRotate>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} {template} />
