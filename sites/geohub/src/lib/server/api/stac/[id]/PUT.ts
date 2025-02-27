import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { getSTAC, upsertSTAC } from '$lib/server/helpers/stac';
import type { Stac } from '$lib/types';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Output = z.custom<Stac>().describe('The object of STAC API or Catalogs');

export const Param = z.object({
	id: z.string().describe(`STAC server ID`)
});

export const Input = z.custom<Stac>().describe('Input body to update.');

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Update STAC API/Catalog';
	c.description = `
**ONLY ALLOW SUPERUSER TO USE THIS API**

Update STAC API/Catalog
	`;
	c = AddSecurictyModifier(c);
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Param, Input, Output, Error, Modifier }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		if (!is_superuser) {
			error(403, { message: 'Permission error' });
		}

		const id = param.id;

		const stac = await getSTAC(id);
		if (!stac) {
			error(404, { message: 'Not found' });
		}

		const body: Stac = (await request.json()) as unknown as Stac;
		const updatedStac = await upsertSTAC(body, user_email);
		return updatedStac as unknown as Stac;
	}
);
