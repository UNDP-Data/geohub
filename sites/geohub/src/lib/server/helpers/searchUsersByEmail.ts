import DatabaseManager from '$lib/server/DatabaseManager';
import type { PoolClient } from 'pg';

export const searchUsersByEmail = async (pool: PoolClient, query: string, limit: number) => {
	const dbm = new DatabaseManager(pool);
	const client = await dbm.start();
	try {
		const sql = {
			text: `
            SELECT id, user_email
            FROM geohub.users
            WHERE user_email ILIKE $1
            ORDER BY user_email
			LIMIT $2
            `,
			values: [`%${query}%`, limit]
		};

		const res = await client.query(sql);

		return res.rows as { id: string; user_email: string }[];
	} finally {
		dbm.end();
	}
};
