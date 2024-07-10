import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { storymap } = data;
	const title = storymap.title;
	const content = `${storymap.title} credited by ${storymap.byline}`;

	return {
		title,
		content,
		storymap
	};
};
