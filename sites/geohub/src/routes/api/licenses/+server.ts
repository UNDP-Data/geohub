import { type RequestHandler, error } from '@sveltejs/kit';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { License } from '$lib/types';

export const GET: RequestHandler = async () => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT id, name FROM geohub.license ORDER BY license asc`
		};
		const res = await client?.query(query);

		const data: License[] = res?.rows as License[];

		return new Response(JSON.stringify(data));
	} catch (err) {
		error(500, err);
	} finally {
		await dbm.end();
	}
};
