import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const title = 'Storymaps | GeoHub';
	const content = 'Explore storymaps';
	const socialImage = new URL(`/assets/storymap-socialimage.png`, url).href;
	return {
		title,
		content,
		socialImage
	};
};
