import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const title = 'Storymaps | GeoHub';
	const content = 'Explore storymaps';
	const site_description = `GeoHub storymap provides you a tool to build a story from visialized GeoHub Maps`;
	const socialImage = new URL(`/assets/storymap-socialimage.png`, url).href;
	return {
		title,
		content,
		site_description,
		socialImage
	};
};
