<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterResampling from './RasterResampling.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterResampling',
		component: RasterResampling,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Resampling Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterResampling {...args}></RasterResampling>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} {template} />
