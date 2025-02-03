import { z } from 'sveltekit-api';

export const Param = z.object({
	lon: z.string().describe('Longitude').openapi({ example: '0' }),
	lat: z.string().describe('Latitude').openapi({ example: '0' }),
	zoom: z.string().min(0).max(23).describe('Latitude').openapi({ example: '0' }),
	bearing: z.string().describe('Bearing').openapi({ example: '0' }),
	pitch: z.string().min(0).max(80).describe('Pitch').openapi({ example: '0' }),
	width: z.string().describe('image width (pixel)').openapi({ example: '300' }),
	height: z.string().describe('image height (pixel)').openapi({ example: '200' }),
	format: z
		.enum(['jpeg', 'png', 'webp'])
		.describe('Supported format (jpeg, png, webp')
		.openapi({ example: 'png' })
});
