import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

/**
 * Continent API
 * return continent data
 */
export const GET: RequestHandler = async ({ url }) => {
	let isTagFilter = false;
	const filterByTag = url.searchParams.get('filterbytag');
	if (filterByTag && filterByTag === 'true') {
		isTagFilter = true;
	}

	const query = sql`
	SELECT
		${countryInGeohub.region1Code} as continent_code, 
		${countryInGeohub.region1Name} as continent_name
  	FROM ${countryInGeohub}`;

	if (isTagFilter) {
		query.append(
			sql`WHERE EXISTS (
				SELECT ${tagInGeohub.id} 
				FROM ${tagInGeohub} 
				WHERE ${tagInGeohub.key}='continent' 
				AND ${tagInGeohub.value}=${countryInGeohub.region1Name}
			)`
		);
	}
	query.append(sql`
		GROUP BY ${countryInGeohub.region1Code}, ${countryInGeohub.region1Name}
		ORDER BY ${countryInGeohub.region1Name}
	`);

	const continents = await db.execute(query);

	return new Response(JSON.stringify(continents));
};
