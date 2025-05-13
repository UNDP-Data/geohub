<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterContrast from './RasterContrast.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterContrast',
		component: RasterContrast,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Contrast Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterContrast {...args}></RasterContrast>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} {template} />
