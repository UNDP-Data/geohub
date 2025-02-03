import { z } from 'sveltekit-api';

export const Param = z.object({
	bbox: z
		.string()
		.describe('bbox (minx, miny, maxx, maxy)')
		.openapi({ example: '-4.04296875,-15.114552871944102,48.69140625,19.476950206488414' }),
	width: z.string().describe('image width (pixel)').openapi({ example: '300' }),
	height: z.string().describe('image height (pixel)').openapi({ example: '200' }),
	format: z
		.enum(['jpeg', 'png', 'webp'])
		.describe('Supported format (jpeg, png, webp')
		.openapi({ example: 'png' })
});
