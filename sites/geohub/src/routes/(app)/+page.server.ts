import type { PageServerLoad } from './$types';
import { getDatasetStats } from '$lib/server/helpers';
import type { MapsData } from '$lib/types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: PageServerLoad = async ({ parent, depends, fetch }) => {
	const parentData = await parent();
	const config: UserConfig = parentData.config;

	const dataset_stats = await getDatasetStats();

	const res = await fetch(
		`/api/style?accesslevel=${AccessLevel.PUBLIC}&limit=${config.HomePageMapSearchLimit}&sortby=${config.HomePageMapSortingColumn}`
	);
	const styles: MapsData = await res.json();

	depends('data:styles');

	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';

	return {
		title,
		content,
		stats: {
			dataset: dataset_stats
		},
		styles
	};
};
