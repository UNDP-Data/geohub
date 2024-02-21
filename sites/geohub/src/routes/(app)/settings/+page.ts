import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { fonts } = data;
	const title = 'Settings | GeoHub';
	const content = 'Settings';

	return {
		title,
		content,
		fonts
	};
};
