import DatabaseManager from '$lib/server/DatabaseManager';

export const getStyleById = async (id: number) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT id, name, style, layers, access_level, createdat, created_user, updatedat, updated_user FROM geohub.style where id = $1`,
			values: [id]
		};

		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}

		return res.rows[0];
	} finally {
		dbm.end();
	}
};
