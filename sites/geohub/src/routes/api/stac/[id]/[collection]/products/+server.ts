import { error, type RequestHandler } from '@sveltejs/kit';
import DatabaseManager from '$lib/server/DatabaseManager';

export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	const query = {
		text: `SELECT * FROM geohub.stac_collection_product WHERE stac_id=$1 AND collection_id=$2`,
		values: [params.id, params.collection]
	};
	const res = await client.query(query).catch((e) => {
		client.release();
		error(500, { message: e.message });
	});
	const products = res.rows;
	client.release();
	return new Response(JSON.stringify(products));
};