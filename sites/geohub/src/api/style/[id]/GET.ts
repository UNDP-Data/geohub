import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AccessLevel, MapStyleIds, Permission, type MapStyleType } from '$lib/config/AppConfig';
import { getStyleById } from '$lib/server/helpers/getStyleById';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';

export const Output = z.custom<DashboardMapStyle>().describe('Style object to return');

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Query = z.object({
	basemap: z
		.enum(['style', 'aerialstyle', 'dark', 'positron', 'blank'])
		.optional()
		.describe('Optional. Switch basemap to user desired style'),
	hillshade: z
		.string()
		.optional()
		.default('false')
		.describe('Optional. If true, enable hillshade layer in style'),
	terrain: z
		.string()
		.optional()
		.default('false')
		.describe('Optional. If true, enable terrain in style')
});

export const Error = {
	400: apiError(400, `Invalid parameters`),
	403: apiError(403, 'Permission error'),
	404: apiError(403, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get style information by style id';
	c.description = 'get style information by style id';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Param, Query, Output, Error, Modifier }).handle(
	async (param, { url, locals }) => {
		const session = await locals.auth();
		const email = session?.user?.email;

		const styleId = Number(param.id);
		if (!styleId) {
			error(400, { message: `id parameter is required.` });
		}

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const basemap = (param.basemap as MapStyleType) ?? '';
		if (basemap.length > 0 && !MapStyleIds.includes(basemap)) {
			error(400, {
				message: `Invalid basemap parameter. It must be one of ${MapStyleIds.join(', ')}.`
			});
		}

		const hillshade = param.hillshade ?? 'false';
		const isHillshade = hillshade.toLowerCase() === 'true';

		const terrain = param.terrain ?? 'false';
		const isTerrain = terrain.toLowerCase() === 'true';

		const style: DashboardMapStyle = (await getStyleById(
			styleId,
			url,
			user_email,
			is_superuser,
			basemap,
			isHillshade,
			isTerrain
		)) as DashboardMapStyle;

		if (!style) {
			error(404, { message: 'Not found' });
		}

		let domain = '';
		if (email) {
			domain = getDomainFromEmail(email);
		}

		if (!is_superuser) {
			if (!(style.permission && style.permission >= Permission.READ)) {
				const accessLevel: AccessLevel = style.access_level;
				if (accessLevel === AccessLevel.PRIVATE) {
					error(403, { message: 'Permission error' });
				} else if (accessLevel === AccessLevel.ORGANIZATION) {
					if (!(domain && style.created_user?.indexOf(domain) > -1)) {
						error(403, { message: 'Permission error' });
					}
				}
			}
		}

		return style;
	}
);
