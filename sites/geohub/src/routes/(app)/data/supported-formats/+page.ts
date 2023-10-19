import type { PageLoad } from './$types';
export const load: PageLoad = async () => {
	const title = 'Supported Data Formats | GeoHub';
	const content = 'Supported Data Formats';

	return {
		title,
		content
	};
};
