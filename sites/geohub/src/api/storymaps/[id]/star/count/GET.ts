import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { getStoryStarCount } from '$lib/server/helpers/getStoryStarCount';

export const Output = z.object({
	storymap_id: z.string().uuid().describe('Storymap UUID'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().uuid().describe('Storymap UUID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get start count for a storymap';
	c.description = 'get the number of stars for a storymap';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param) => {
	const storymap_id = param.id;

	const stars = await getStoryStarCount(storymap_id);

	return {
		storymap_id,
		no_stars: stars
	};
});
