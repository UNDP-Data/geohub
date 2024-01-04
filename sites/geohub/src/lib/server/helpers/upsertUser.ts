import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';

export const upsertUser = async (user_email: string) => {
	const dbm = new DatabaseManager();
	try {
		const client = await dbm.start();

		const query = {
			text: `
			INSERT INTO geohub.users (id, user_email) values(MD5($1), $1)
			ON CONFLICT (id) DO UPDATE SET lastaccessedat = now()
			`,
			values: [user_email]
		};
		await client.query(query);
	} catch (e) {
		error(500, e);
	} finally {
		await dbm.end();
	}
};
