import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { getDatasetStats } from '$lib/server/helpers/getDatasetStats';
import type { StatsCard } from '@undp-data/svelte-undp-design';

export const Output = z
	.custom<StatsCard[]>()
	.describe('datasets statistics')
	.openapi({
		example: [
			{ stat: 4439, title: 'Public datasets', description: 'The number of public datasets' },
			{ stat: 4203, title: 'Global datasets', description: 'The number of public global datasets' },
			{ stat: 4351, title: 'SDG datasets', description: 'We have datasets across all SDGs' },
			{
				stat: 108,
				title: 'Country datasets',
				description: 'The number of public datasets linked to at least a country'
			},
			{
				stat: 42,
				title: 'Countries',
				description: 'The number of countries having GeoHub datasets'
			}
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get statistics for published datasets';
	c.description = 'This endpoint is to get statistics for published datasets';
	c.tags = ['datasets'];
	return c;
};

export default new Endpoint({ Output, Modifier }).handle(async () => {
	const cards = await getDatasetStats();
	return cards;
});
