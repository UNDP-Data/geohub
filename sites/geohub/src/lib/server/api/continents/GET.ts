import { db } from '$lib/server/db';
import { countryInGeohub, tagInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { Continent } from '$lib/types';

export const Query = z.object({
	filterbytag: z
		.string()
		.default('false')
		.optional()
		.describe('If true, only returns regions which exist in tag table')
});

export const Output = z
	.custom<Continent[]>()
	.describe('The list of continents including continent code and name.')
	.openapi({
		example: [
			{
				continent_code: 2,
				continent_name: 'Africa'
			},
			{
				continent_code: 19,
				continent_name: 'Americas'
			},
			{
				continent_code: 142,
				continent_name: 'Asia'
			},
			{
				continent_code: 150,
				continent_name: 'Europe'
			},
			{
				continent_code: 9,
				continent_name: 'Oceania'
			}
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get continents';
	c.description = `Get continents data from database`;
	c.tags = ['admin'];
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param) => {
	let isTagFilter = false;
	const filterByTag = param.filterbytag ?? 'false';
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

	const continents = (await db.execute(query)) as unknown as Continent[];

	return continents;
});
