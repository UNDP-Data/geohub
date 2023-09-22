import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { wss, promises } = data;
	const title = 'Data | GeoHub';
	const content = 'Data Portal';

	return {
		title,
		content,
		wss,
		promises
	};
};

export const csr = true;
export const ssr = false;
