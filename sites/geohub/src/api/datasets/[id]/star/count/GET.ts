import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { getDatasetStarCount } from '$lib/server/helpers/getDatasetStarCount';

export const Output = z.object({
	dataset_id: z.string().describe('Dataset ID'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get start count for a dataset';
	c.description = 'get the number of stars for a dataset';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param) => {
	const dataset_id = param.id;

	const stars = await getDatasetStarCount(dataset_id);
	return {
		dataset_id,
		no_stars: stars
	};
});
