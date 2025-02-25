import { db } from '$lib/server/db';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { Country } from '$lib/types';

export const Query = z.object({
	continent: z.string().optional().describe('a continent code'),
	region: z.string().optional().describe('a regional code'),
	filterbytag: z
		.string()
		.default('false')
		.optional()
		.describe('If true, only returns regions which exist in tag table')
});

export const Output = z
	.custom<Country[]>()
	.describe('The list of countries including continent code and name.')
	.openapi({
		example: [
			{
				iso_3: 'ATA',
				iso_code: 10,
				iso_2: 'AQ',
				country_name: 'Antarctica',
				region_code: 0,
				region_name: 'Antarctica',
				continent_code: 0,
				continent_name: 'Antarctica'
			}
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get countries';
	c.description = `get countries data from database`;
	c.tags = ['admin'];
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param) => {
	const continent_code = param.continent;
	const region_code = param.region;

	let isTagFilter = false;
	const filterByTag = param.filterbytag ?? 'false';
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

	const countries = (await db.execute(query)) as unknown as Country[];

	return countries;
});
