import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { getSTAC, upsertSTAC } from '$lib/server/helpers/stac';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import type { Stac } from '$lib/types';

export const Output = z.custom<Stac>();

export const Input = z.custom<Stac>().openapi({
	example: {
		id: 'maxar-opendata',
		name: 'Maxar Open Data',
		url: 'https://maxar-opendata.s3.amazonaws.com/events/catalog.json',
		type: 'catalog',
		providers: ['Maxar Technologies'],
		createdat: '2023-12-07 08:56:02.101987+00',
		createdUser: 'jin.igarashi@undp.org',
		updatedat: undefined,
		updatedUser: undefined
	}
});

export const Error = {
	400: apiError(
		400,
		'XXXX is already registered at the database, please use PUT if you want to update this.'
	),
	403: apiError(403, 'Permission error')
};

const description = `
**ONLY ALLOW SUPERUSER TO USE THIS API**

Register STAC catalog/api
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register STAC catalog/api';
	c.description = description;
	c.tags = ['stac'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(
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

		const body: Stac = (await request.json()) as unknown as Stac;

		const exists = await getSTAC(body.id);
		if (exists) {
			error(400, {
				message: `${body.id} is already registered at the database, please use PUT if you want to update this.`
			});
		}

		const updatedStac = await upsertSTAC(body, user_email);

		return updatedStac as unknown as Stac;
	}
);
