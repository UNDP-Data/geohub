import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { getSTACs } from '$lib/server/helpers/stac';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import type { Stac } from '$lib/types';

export const Output = z.custom<Stac[]>().describe('The list of STAC API or Catalogs');

export const Query = z.object({
	type: z.enum(['api', 'catalog']).describe(`STAC type either 'api' or 'catalog'`)
});

export const Error = {
	403: apiError(403, 'Permission error')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get supported STAC API/Catalog List';
	c.description = 'Get supported STAC API/Catalog List';
	c.tags = ['stac'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Query, Output, Error, Modifier }).handle(
	async (param, { locals }) => {
		const session = await locals.auth();

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		if (!is_superuser) {
			error(403, { message: 'Permission error' });
		}

		const type = param.type;
		const stacs = await getSTACs();
		const filtered = stacs.filter((s) => s.type === type);
		return filtered;
	}
);
