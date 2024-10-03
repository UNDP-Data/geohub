import type { RequestHandler } from './$types';
import { getStyleStarCount } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { styleFavouriteInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const style_id = parseInt(params.id);
	const user_email = session.user.email;
	const now = new Date().toISOString();

	await db
		.insert(styleFavouriteInGeohub)
		.values({ styleId: style_id, userEmail: user_email, savedat: now })
		.onConflictDoUpdate({
			target: [styleFavouriteInGeohub.styleId, styleFavouriteInGeohub.userEmail],
			set: {
				savedat: now
			}
		});

	const stars = await getStyleStarCount(style_id);

	const res = {
		style_id,
		user_email,
		savedat: now,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const style_id = parseInt(params.id);
	const user_email = session.user.email;

	await db
		.delete(styleFavouriteInGeohub)
		.where(
			sql`${styleFavouriteInGeohub.styleId} = ${style_id} AND ${styleFavouriteInGeohub.userEmail} = ${user_email}`
		);

	const stars = await getStyleStarCount(style_id);

	const res = {
		style_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
