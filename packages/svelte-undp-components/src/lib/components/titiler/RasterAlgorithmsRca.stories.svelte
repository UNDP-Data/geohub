<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
	import Map from '../maplibre/Map.svelte';
	import RasterAlgorithms from './RasterAlgorithms.svelte';

	const { Story } = defineMeta({
		title: 'Components/titiler/RasterAlgorithms/RCA',
		component: RasterAlgorithms,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			},
			algorithmId: {
				control: 'select',
				options: [
					'hillshade',
					'contours',
					'normalizedIndex',
					'terrarium',
					'terrainrgb',
					'rca',
					'flood_detection'
				],
				defaultValue: ''
			}
		}
	});

	const title = 'Raster Algorithms Control';

	const source: RasterSourceSpecification = {
		type: 'raster',
		tiles: [
			'https://titiler-dev.undpgeohub.org/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=https%3A%2F%2Ftitiler-dev.undpgeohub.org%2Fvrt%3FdXJsPWh0dHBzJTNBJTJGJTJGdW5kcGdlb2h1Yi5ibG9iLmNvcmUud2luZG93cy5uZXQlMkZzdGFjZGF0YSUyRm5pZ2h0dGltZS1saWdodHMlMkYyMDI0JTJGMDklMkYxMCUyRlNWRE5CX25wcF9kMjAyNDA5MTAucmFkZTlkLnRpZiZ1cmw9aHR0cHMlM0ElMkYlMkZ1bmRwZ2VvaHViLmJsb2IuY29yZS53aW5kb3dzLm5ldCUyRnN0YWNkYXRhJTJGbmlnaHR0aW1lLWxpZ2h0cyUyRjIwMjQlMkYwOSUyRjI0JTJGU1ZETkJfbnBwX2QyMDI0MDkyNC5yYWRlOWQudGlmJnVybD1odHRwcyUzQSUyRiUyRnVuZHBnZW9odWIuYmxvYi5jb3JlLndpbmRvd3MubmV0JTJGc3RhY2RhdGElMkZuaWdodHRpbWUtbGlnaHRzJTJGMjAyNCUyRjA5JTJGMTAlMkZTVkROQl9ucHBfZDIwMjQwOTEwLnZjbGQudGlmJnVybD1odHRwcyUzQSUyRiUyRnVuZHBnZW9odWIuYmxvYi5jb3JlLndpbmRvd3MubmV0JTJGc3RhY2RhdGElMkZuaWdodHRpbWUtbGlnaHRzJTJGMjAyNCUyRjA5JTJGMjQlMkZTVkROQl9ucHBfZDIwMjQwOTI0LnZjbGQudGlm&scale=1&resampling=nearest&return_mask=true&algorithm=rca&colormap_name=rdylbu&unscale=true'
		],
		tileSize: 256,
		minzoom: 0,
		maxzoom: 8,
		bounds: [-180, -65.00048780094465, 180, 75.00059725583678],
		attribution: 'Colorado Schools of Mines,UNDP'
	};

	const layer: RasterLayerSpecification = {
		id: '9eb245a3-16fc-49b1-a4c3-e2d51b4700c8',
		type: 'raster',
		source: '9eb245a3-16fc-49b1-a4c3-e2d51b4700c8',
		minzoom: 0,
		layout: {
			visibility: 'visible'
		},
		paint: {
			'raster-resampling': 'nearest',
			'raster-opacity': 1
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer} zoom={12.7} center={[22.6393, 32.75113]}>
		<RasterAlgorithms {...args}></RasterAlgorithms>
	</Map>
{/snippet}

<Story
	name="hillshade"
	args={{
		layerId: layer.id,
		algorithmsApi: 'https://titiler-dev.undpgeohub.org/algorithms',
		algorithmId: 'rca'
	}}
	children={template}
/>
