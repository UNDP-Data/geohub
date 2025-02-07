import { CommonParam } from '$api/shared';
import { z } from 'sveltekit-api';

export const Param = z
	.object({
		bbox: z
			.string()
			.describe('bbox (minx, miny, maxx, maxy)')
			.openapi({ example: '-4.04296875,-15.114552871944102,48.69140625,19.476950206488414' })
	})
	.merge(CommonParam);
