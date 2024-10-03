import { sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const getStyleCount = async (where: SQL) => {
	const sqlChunks: SQL[] = [];
	sqlChunks.push(sql.raw(`SELECT count(*) as count FROM geohub.style x`));
	if (where) {
		sqlChunks.push(where);
	}
	const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
	const data = await db.execute(finalSql);
	if (data.length === 0) {
		return 0;
	} else {
		return data[0].count as number;
	}
};
