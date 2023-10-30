import type { RequestHandler } from './$types';
import DatabaseManager from '$lib/server/DatabaseManager';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const GET: RequestHandler = async () => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT count(*) as count FROM geohub.style`,
			values: []
		};

		const res = await client.query(query);

		return new Response(JSON.stringify({ count: Number(res.rows[0].count) }));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
};
