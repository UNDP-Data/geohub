import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Map | GeoHub';
	const content = 'Map';

	return {
		title,
		content
	};
};

export const csr = true;
export const ssr = false;
