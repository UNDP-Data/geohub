import type { RequestHandler } from './$types';
import { getDatasetStarCount } from '$lib/server/helpers';
import { db } from '$lib/server/db';
import { datasetFavouriteInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}

	const dataset_id = params.id;
	const user_email = session.user.email;
	const now = new Date().toISOString();

	await db
		.insert(datasetFavouriteInGeohub)
		.values({ datasetId: dataset_id, userEmail: user_email, savedat: now })
		.onConflictDoUpdate({
			target: [datasetFavouriteInGeohub.datasetId, datasetFavouriteInGeohub.userEmail],
			set: {
				savedat: now
			}
		});

	const stars = await getDatasetStarCount(dataset_id);

	const res = {
		dataset_id,
		user_email,
		savedat: now,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}

	const dataset_id = params.id;
	const user_email = session.user.email;

	await db
		.delete(datasetFavouriteInGeohub)
		.where(
			sql`${datasetFavouriteInGeohub.datasetId} = ${dataset_id} AND ${datasetFavouriteInGeohub.userEmail} = ${user_email}`
		);

	const stars = await getDatasetStarCount(dataset_id);

	const res = {
		dataset_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
