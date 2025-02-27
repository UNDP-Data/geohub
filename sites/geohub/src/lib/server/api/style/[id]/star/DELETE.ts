import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { db } from '$lib/server/db';
import { styleFavouriteInGeohub } from '$lib/server/schema';
import { getStyleStarCount } from '$lib/server/helpers/getStyleStarCount';
import { sql } from 'drizzle-orm';

export const Output = z.object({
	style_id: z.number().describe('style ID'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete style from favourite';
	c.description = 'Delete style from favourite This API only can be used when user sign in.';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const style_id = parseInt(param.id);
	const user_email = session.user.email;

	await db
		.delete(styleFavouriteInGeohub)
		.where(
			sql`${styleFavouriteInGeohub.styleId} = ${style_id} AND ${styleFavouriteInGeohub.userEmail} = ${user_email}`
		);

	const stars = await getStyleStarCount(style_id);

	return {
		style_id,
		no_stars: stars
	};
});
