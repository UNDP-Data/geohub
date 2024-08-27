import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { fonts, images } = data;
	const title = 'Settings | GeoHub';
	const content = 'Settings';

	return {
		title,
		content,
		fonts,
		images
	};
};
