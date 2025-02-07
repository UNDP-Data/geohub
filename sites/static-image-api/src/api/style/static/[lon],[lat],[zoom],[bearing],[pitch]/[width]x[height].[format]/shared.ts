import { z } from 'sveltekit-api';
import { CommonParam } from '$api/shared';

export const Param = z
	.object({
		lon: z.string().describe('Longitude').openapi({ example: '0' }),
		lat: z.string().describe('Latitude').openapi({ example: '0' }),
		zoom: z.string().min(0).max(23).describe('Latitude').openapi({ example: '0' }),
		bearing: z.string().describe('Bearing').openapi({ example: '0' }),
		pitch: z.string().min(0).max(80).describe('Pitch').openapi({ example: '0' })
	})
	.merge(CommonParam);
