import type { PageServerLoad } from './$types';
import { getDatasetStats } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import type { RasterAlgorithm } from '@undp-data/svelte-undp-components';

export const load: PageServerLoad = async ({ depends, fetch }) => {
	const dataset_stats = await getDatasetStats();

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
		algorithms
	};
};

const getAlgorithms = async (fetch) => {
	try {
		const apiUrl = `${env.TITILER_ENDPOINT.replace('/cog', '')}/algorithms`;
		const res = await fetch(apiUrl);
		const algorithms: { [key: string]: RasterAlgorithm } = await res.json();
		return algorithms;
	} catch (error) {
		console.error('Error fetching algorithms:', error);
		return {};
	}
};
