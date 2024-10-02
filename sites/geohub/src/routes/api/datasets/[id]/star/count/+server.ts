import type { RequestHandler } from './$types';
import { getDatasetStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

export const GET: RequestHandler = async ({ params }) => {
	const dataset_id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const stars = await getDatasetStarCount(client, dataset_id);

		const res = {
			dataset_id,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
};
