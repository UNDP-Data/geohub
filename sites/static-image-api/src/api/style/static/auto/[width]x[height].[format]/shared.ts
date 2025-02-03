import { z } from 'sveltekit-api';

export const Param = z.object({
	width: z.string().describe('image width (pixel)').openapi({ example: '300' }),
	height: z.string().describe('image height (pixel)').openapi({ example: '200' }),
	format: z
		.enum(['jpeg', 'png', 'webp'])
		.describe('Supported format (jpeg, png, webp')
		.openapi({ example: 'png' })
});
