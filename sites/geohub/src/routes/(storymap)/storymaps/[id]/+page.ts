import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { storymap } = data;
	const title = storymap.title;
	const site_description = `${storymap.title} credited by ${storymap.byline}`;

	return {
		title,
		site_description,
		storymap
	};
};
