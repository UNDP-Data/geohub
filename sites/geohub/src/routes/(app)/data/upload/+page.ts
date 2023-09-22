import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Data upload | GeoHub';
	const content = 'Data upload';

	return {
		title,
		content
	};
};

export const csr = true;
export const ssr = false;
