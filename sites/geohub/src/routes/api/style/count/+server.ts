import type { RequestHandler } from './$types';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const GET: RequestHandler = async ({ locals }) => {
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT count(*) as count FROM geohub.style`,
			values: []
		};

		const res = await client.query(query);

		return new Response(JSON.stringify({ count: Number(res.rows[0].count) }));
	} catch (err) {
		error(400, err);
	} finally {
		dbm.end();
	}
};
