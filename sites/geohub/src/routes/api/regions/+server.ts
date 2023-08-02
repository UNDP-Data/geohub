import type { RequestHandler } from './$types';
import DatabaseManager from '$lib/server/DatabaseManager';

/**
 * Region API
 * return region data
 */
export const GET: RequestHandler = async ({ url }) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	const continent_code = url.searchParams.get('continent');
	try {
		const values = [];
		if (continent_code) {
			values.push(continent_code);
		}

		let isTagFilter = false;
		const filterByTag = url.searchParams.get('filterbytag');
		if (filterByTag && filterByTag === 'true') {
			isTagFilter = true;
		}

		const sql = {
			text: `
      SELECT region2_code as region_code, region2_name as region_name, region1_code as continent_code, region1_name as continent_name
      FROM geohub.country
      ${
				isTagFilter
					? `WHERE EXISTS (select id FROM geohub.tag WHERE key='region' and value=region2_name)`
					: ''
			}
      ${continent_code ? `${isTagFilter ? 'AND' : 'WHERE'} region1_code = $1` : ''}
      GROUP BY region2_code, region2_name, region1_code, region1_name
      ORDER BY region2_name`,
			values: values
		};
		// console.log(sql)
		const res = await client.query(sql);
		return new Response(JSON.stringify(res.rows));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		await dbm.end();
	}
};
