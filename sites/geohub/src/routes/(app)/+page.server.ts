import type { PageServerLoad } from './$types';
import { getDatasetStats } from '$lib/server/helpers';
import type { MapsData } from '$lib/types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';
import type { RasterAlgorithm } from '@undp-data/svelte-undp-components';

export const load: PageServerLoad = async ({ parent, depends, fetch }) => {
	const parentData = await parent();
	const config: UserConfig = parentData.config;

	const dataset_stats = await getDatasetStats();

	const res = await fetch(
		`/api/style?accesslevel=${AccessLevel.PUBLIC}&limit=${config.HomePageMapSearchLimit}&sortby=${config.HomePageMapSortingColumn}`
	);
	const styles: MapsData = await res.json();

	const algorithms = await getAlgorithms(fetch);

	depends('data:styles');

	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';

	return {
		title,
		content,
		stats: {
			dataset: dataset_stats
		},
		styles,
		algorithms
	};
};

const getAlgorithms = async (fetch) => {
	const apiUrl = `${env.TITILER_ENDPOINT.replace('/cog', '')}/algorithms`;
	const res = await fetch(apiUrl);
	const algorithms: { [key: string]: RasterAlgorithm } = await res.json();
	return algorithms;
};
