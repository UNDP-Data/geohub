import { db } from '$lib/server/db';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { Region } from '$lib/types';

export const Query = z.object({
	continent: z.string().optional().describe('a continent code'),
	filterbytag: z
		.string()
		.default('false')
		.optional()
		.describe('If true, only returns regions which exist in tag table')
});

export const Output = z
	.custom<Region[]>()
	.describe('The list of regions including region code and name.')
	.openapi({
		example: [
			{
				region_code: 15,
				region_name: 'Northern Africa',
				continent_code: 2,
				continent_name: 'Africa'
			},
			{
				region_code: 202,
				region_name: 'Sub-Saharan Africa',
				continent_code: 2,
				continent_name: 'Africa'
			}
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get regions';
	c.description = `get regions data from database`;
	c.tags = ['admin'];
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param) => {
	const continent_code = param.continent;

	let isTagFilter = false;
	const filterByTag = param.filterbytag ?? 'false';
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

	const regions = (await db.execute(query)) as unknown as Region[];

	return regions;
});
