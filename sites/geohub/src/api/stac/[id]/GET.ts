import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { getSTAC } from '$lib/server/helpers/stac';
import type { Stac } from '$lib/types';

export const Output = z.custom<Stac>().describe('The object of STAC API or Catalogs');

export const Param = z.object({
	id: z.string().describe(`STAC server ID`)
});

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get STAC API/Catalog info by ID';
	c.description = 'get STAC API/Catalog info by ID';
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Param, Output, Error, Modifier }).handle(async (param) => {
	const id = param.id;

	const stac = await getSTAC(id);
	if (!stac) {
		error(404, { message: 'Not found' });
	}

	return stac;
});
