import type { RequestHandler } from './$types';
import { getStyleStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

export const GET: RequestHandler = async ({ params, locals }) => {
	const style_id = parseInt(params.id);

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();
	try {
		const stars = await getStyleStarCount(client, style_id);

		const res = {
			style_id,
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
