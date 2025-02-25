import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { db } from '$lib/server/db';
import { storymapFavouriteInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { getStoryStarCount } from '$lib/server/helpers/getStoryStarCount';

export const Output = z.object({
	storymap_id: z.string().uuid().describe('storymap UUID'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().uuid().describe('storymap UUID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete storymap from favourite';
	c.description = 'Delete storymap from favourite This API only can be used when user sign in.';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No storymap found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const storymap_id = param.id;
	const user_email = session.user.email;

	await db
		.delete(storymapFavouriteInGeohub)
		.where(
			sql`${storymapFavouriteInGeohub.storymapId} = ${storymap_id} AND ${storymapFavouriteInGeohub.userEmail} = ${user_email}`
		);

	const stars = await getStoryStarCount(storymap_id);

	return {
		storymap_id,
		no_stars: stars
	};
});
