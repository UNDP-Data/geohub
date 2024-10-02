import type { RequestHandler } from './$types';
import { getStoryStarCount } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { storymapFavouriteInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const storymap_id = params.id;
	const user_email = session.user.email;
	const now = new Date().toISOString();

	await db
		.insert(storymapFavouriteInGeohub)
		.values({ storymapId: storymap_id, userEmail: user_email, savedat: now })
		.onConflictDoUpdate({
			target: [storymapFavouriteInGeohub.storymapId, storymapFavouriteInGeohub.userEmail],
			set: {
				savedat: now
			}
		});

	const stars = await getStoryStarCount(storymap_id);

	const res = {
		storymap_id,
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

	const storymap_id = params.id;
	const user_email = session.user.email;

	await db
		.delete(storymapFavouriteInGeohub)
		.where(
			sql`${storymapFavouriteInGeohub.storymapId} = ${storymap_id} AND ${storymapFavouriteInGeohub.userEmail} = ${user_email}`
		);

	const stars = await getStoryStarCount(storymap_id);

	const res = {
		storymap_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
