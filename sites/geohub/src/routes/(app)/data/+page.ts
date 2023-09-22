import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { wssUrl, promises } = data;
	const title = 'Data | GeoHub';
	const content = 'Data Portal';

	return {
		title,
		content,
		wssUrl,
		promises
	};
};

export const csr = true;
export const ssr = false;
