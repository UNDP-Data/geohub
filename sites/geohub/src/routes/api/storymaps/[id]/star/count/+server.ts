import type { RequestHandler } from './$types';
import { getStoryStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const storymap_id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const stars = await getStoryStarCount(client, storymap_id);

		const res = {
			storymap_id,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.end();
	}
};
