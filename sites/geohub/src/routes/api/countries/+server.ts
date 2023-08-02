import type { RequestHandler } from './$types';
import DatabaseManager from '$lib/server/DatabaseManager';

/**
 * Country API
 * return country data
 */
export const GET: RequestHandler = async ({ url }) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	const continent_code = url.searchParams.get('continent');
	const region_code = url.searchParams.get('region');
	try {
		const values = [];
		const wheres: string[] = [];
		if (continent_code) {
			values.push(continent_code);
			wheres.push(` region1_code=$${values.length} `);
		}
		if (region_code) {
			values.push(region_code);
			wheres.push(` region2_code=$${values.length} `);
		}

		let isTagFilter = false;
		const filterByTag = url.searchParams.get('filterbytag');
		if (filterByTag && filterByTag === 'true') {
			isTagFilter = true;
		}

		const sql = {
			text: `
      SELECT 
        iso_3, 
        iso_code, 
        iso_2, 
        name as country_name,
        region2_code as region_code, 
        region2_name as region_name, 
        region1_code as continent_code, 
        region1_name as continent_name
      FROM geohub.country
      ${continent_code || region_code ? `WHERE ${wheres.join(' AND ')}` : ''}
      ${
				isTagFilter
					? `${
							continent_code || region_code ? `AND` : 'WHERE'
					  } EXISTS (select id FROM geohub.tag WHERE key='country' and value=iso_3)`
					: ''
			}
      GROUP BY 
        iso_3, 
        iso_code, 
        iso_2, 
        name,
        region2_code, 
        region2_name, 
        region1_code, 
        region1_name
      ORDER BY name`,
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
		dbm.end();
	}
};
