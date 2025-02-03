import type { StyleSpecification } from 'maplibre-gl';
import { z } from 'sveltekit-api';

export const Output = z
	.object({
		'Content-type': z.string().regex(/^image\/(png|jpeg|webp)$/)
	})
	.describe('Static image binary data');

export const Query = z.object({
	url: z.string().describe('URL of style.json').openapi({
		example: 'https:/dev.undpgeohub.org/api/mapstyle/style.json'
	}),
	ratio: z
		.string()
		// .enum(['1', '2', '3', '4'])
		.min(1)
		.max(4)
		.default('1')
		.optional()
		.describe('ratio. either 1 or 2 or 3 or 4. Default is 1')
});

export const QueryRatioOnly = z.object({
	ratio: z
		.string()
		// .enum(['1', '2', '3', '4'])
		.min(1)
		.max(4)
		.default('1')
		.optional()
		.describe('ratio. either 1 or 2 or 3 or 4. Default is 1')
});

export const Input = z
	.custom<StyleSpecification>()
	.describe(
		'Maplibre Style JSON Object. Please refer to their official documentation at https://maplibre.org/maplibre-style-spec/'
	)
	.openapi({
		example: {
			version: 8,
			name: 'Voyager',
			metadata: {},
			sources: {
				terrarium: {
					type: 'raster-dem',
					attribution:
						'&copy; <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">Tilezen Joerd</a>',
					tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
					minzoom: 0,
					maxzoom: 15,
					tileSize: 256,
					encoding: 'terrarium',
					bounds: [-180, -90, 180, 90]
				}
			},
			sprite: 'https:/dev.undpgeohub.org/api/mapstyle/sprite/sprite',
			glyphs: 'https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf',
			layers: [
				{
					id: 'background',
					type: 'background',
					layout: {
						visibility: 'visible'
					},
					paint: {
						'background-color': '#fbf8f3',
						'background-opacity': 1
					}
				},
				{
					id: 'hillshade',
					type: 'hillshade',
					source: 'terrarium',
					paint: {
						'hillshade-shadow-color': 'hsl(39, 21%, 33%)',
						'hillshade-illumination-direction': 315,
						'hillshade-exaggeration': 0.8
					}
				}
			]
		}
	});
