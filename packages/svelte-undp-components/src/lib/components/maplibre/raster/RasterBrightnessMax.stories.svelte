<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterBrightnessMax from './RasterBrightnessMax.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterBrightnessMax',
		component: RasterBrightnessMax,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Brightness Max Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterBrightnessMax {...args}></RasterBrightnessMax>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} tags={['autodocs']} children={template} />
