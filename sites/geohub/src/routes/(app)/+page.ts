import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { promises } = data;
	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';

	return {
		title,
		content,
		promises
	};
};

export const csr = true;
export const ssr = false;
