import type { RequestHandler } from './$types';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

/**
 * Region API
 * return region data
 */
export const GET: RequestHandler = async ({ url }) => {
	const continent_code = url.searchParams.get('continent');

	let isTagFilter = false;
	const filterByTag = url.searchParams.get('filterbytag');
	if (filterByTag && filterByTag === 'true') {
		isTagFilter = true;
	}

	const query = sql`
		SELECT
			${countryInGeohub.region2Code} as region_code, 
			${countryInGeohub.region2Name} as region_name,
			${countryInGeohub.region1Code} as continent_code, 
			${countryInGeohub.region1Name} as continent_name
		FROM ${countryInGeohub}`;

	if (isTagFilter) {
		query.append(
			sql`WHERE EXISTS (
					SELECT ${tagInGeohub.id} 
					FROM ${tagInGeohub} 
					WHERE ${tagInGeohub.key}='region' 
					AND ${tagInGeohub.value}=${countryInGeohub.region2Name}
				)`
		);
	}
	if (continent_code) {
		if (isTagFilter) {
			query.append(sql`AND`);
		} else {
			query.append(sql`WHERE`);
		}
		query.append(sql`${countryInGeohub.region1Code} = ${continent_code}`);
	}

	query.append(sql`
			GROUP BY ${countryInGeohub.region2Code}, ${countryInGeohub.region2Name}, ${countryInGeohub.region1Code}, ${countryInGeohub.region1Name}
			ORDER BY ${countryInGeohub.region2Name}
		`);

	const regions = await db.execute(query);

	return new Response(JSON.stringify(regions));
};
