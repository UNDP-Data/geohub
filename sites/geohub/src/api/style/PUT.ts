import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { db } from '$lib/server/db';
import type { DashboardMapStyle } from '$lib/types';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { Permission } from '$lib/config/AppConfig';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { getStyleById } from '$lib/server/helpers/getStyleById';
import { styleInGeohub } from '$lib/server/schema';
import type { StyleSpecification } from 'maplibre-gl';
import { eq } from 'drizzle-orm';

export const Output = z
	.custom<DashboardMapStyle>()
	.describe('Style object to return after updating');

export const Input = z.custom<DashboardMapStyle>().describe('Style object to save');

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Style update API';
	c.description = 'Update style.json to PostgreSQL database';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	400: apiError(400, `Invalid parameters`),
	403: apiError(403, 'Permission error'),
	500: apiError(500, 'Internal server error')
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(
	async (param, { request, url, locals }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}

		const body = await request.json();
		if (!body.name) {
			error(400, { message: 'name property is required' });
		}
		if (!body.style) {
			error(400, { message: 'style property is required' });
		}
		if (!body.layers) {
			error(400, { message: 'layers property is required' });
		}
		if (!body.access_level) {
			error(400, { message: 'access_level property is required' });
		}

		const id = body.id;

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		let style = (await getStyleById(id, url, user_email, is_superuser)) as DashboardMapStyle;

		if (!is_superuser) {
			// not allow to edit if don't have write/owner permission
			if (!(style.permission && style.permission >= Permission.WRITE)) {
				error(403, { message: 'Permission error. Needs WRITE/OWNER permission to edit style.' });
			}
		}

		const styleJson: StyleSpecification = body.style;

		// delete sky
		if ('sky' in styleJson) {
			delete styleJson.sky;
		}

		Object.keys(styleJson.sources).forEach((key) => {
			const source = styleJson.sources[key];
			if ('url' in source && source.url?.startsWith(url.origin)) {
				source.url = source.url.replace(url.origin, '');
			} else if ('tiles' in source) {
				source.tiles?.forEach((tile) => {
					if (tile.startsWith(url.origin)) {
						tile = tile.replace(url.origin, '');
					}
				});
			}
		});

		const now = new Date().toISOString();

		const res = await db
			.update(styleInGeohub)
			.set({
				name: body.name,
				style: styleJson,
				layers: body.layers,
				accessLevel: body.access_level,
				updatedUser: session.user.email,
				updatedat: now
			})
			.where(eq(styleInGeohub.id, id))
			.returning({ id: styleInGeohub.id });

		const styleId = res[0].id;

		style = (await getStyleById(
			styleId,
			url,
			session?.user?.email,
			is_superuser
		)) as DashboardMapStyle;
		return style;
	}
);
