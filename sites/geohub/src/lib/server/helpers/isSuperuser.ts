import DatabaseManager from '$lib/server/DatabaseManager';

export const isSuperuser = async (user_email: string) => {
	const dbm = new DatabaseManager();
	try {
		const client = await dbm.start();
		const query = {
			text: `SELECT user_email FROM geohub.superuser WHERE user_email = $1`,
			values: [user_email]
		};
		const res = await client.query(query);
		return res.rowCount > 0;
	} finally {
		await dbm.end();
	}
};
