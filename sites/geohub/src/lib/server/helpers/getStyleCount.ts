import DatabaseManager from '$lib/server/DatabaseManager';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const getStyleCount = async (where: string, values: string[]) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT count(*) as count FROM geohub.style x ${where}`,
			values: values
		};

		const res = await client.query(query);

		return Number(res.rows[0].count);
	} finally {
		dbm.end();
	}
};
