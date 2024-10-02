import type { RequestHandler } from './$types';
import { sql } from 'drizzle-orm';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';

/**
 * Country API
 * return country data
 */
export const GET: RequestHandler = async ({ url }) => {
	const continent_code = url.searchParams.get('continent');
	const region_code = url.searchParams.get('region');

	let isTagFilter = false;
	const filterByTag = url.searchParams.get('filterbytag');
	if (filterByTag && filterByTag === 'true') {
		isTagFilter = true;
	}

	const query = sql`
		SELECT
			${countryInGeohub.iso3} as iso_3, 
			${countryInGeohub.isoCode} as iso_code,
			${countryInGeohub.iso2} as iso_2, 
			${countryInGeohub.name} as country_name,
			${countryInGeohub.region2Code} as region_code, 
			${countryInGeohub.region2Name} as region_name,
			${countryInGeohub.region1Code} as continent_code, 
			${countryInGeohub.region1Name} as continent_name
		FROM ${countryInGeohub}`;

	if (continent_code || region_code) {
		query.append(sql`WHERE`);
	}

	if (continent_code) {
		query.append(sql`${countryInGeohub.region1Code}=${continent_code} `);
	}
	if (region_code) {
		if (continent_code) {
			query.append(sql`AND`);
		}
		query.append(sql`${countryInGeohub.region2Code}=${region_code} `);
	}

	if (isTagFilter) {
		if (continent_code || region_code) {
			query.append(sql`AND `);
		} else {
			query.append(sql`WHERE `);
		}

		query.append(sql`EXISTS (
			SELECT ${tagInGeohub.id} 
			FROM ${tagInGeohub} 
			WHERE ${tagInGeohub.key}='country' 
			AND ${tagInGeohub.value}=iso_3)`);
	}

	query.append(sql`
	GROUP BY
	    ${countryInGeohub.iso3}, 
		${countryInGeohub.isoCode},
		${countryInGeohub.iso2}, 
		${countryInGeohub.name},
		${countryInGeohub.region2Code}, 
		${countryInGeohub.region2Name},
		${countryInGeohub.region1Code}, 
		${countryInGeohub.region1Name}
	ORDER BY ${countryInGeohub.name}
	`);

	const countries = await db.execute(query);

	return new Response(JSON.stringify(countries));
};
