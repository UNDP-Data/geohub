import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { wss, datasets, ingestingDatasets, tags } = data;
	const title = 'Data | GeoHub';
	const content = 'Data Portal';

	return {
		title,
		content,
		wss,
		datasets,
		ingestingDatasets,
		tags
	};
};

// export const csr = true;
// export const ssr = false;
