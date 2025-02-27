import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { getStyleStarCount } from '$lib/server/helpers/getStyleStarCount';

export const Output = z.object({
	style_id: z.number().describe('style ID'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get start count for a style';
	c.description = 'get the number of stars for a style';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param) => {
	const style_id = parseInt(param.id);

	const stars = await getStyleStarCount(style_id);

	return {
		style_id,
		no_stars: stars
	};
});
