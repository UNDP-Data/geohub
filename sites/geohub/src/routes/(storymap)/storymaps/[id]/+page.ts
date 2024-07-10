import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { storymap, socialImage } = data;
	const title = `${storymap.title} | GeoHub`;
	const site_description = `GeoHub storymap for ${storymap.title} credited by ${storymap.byline}`;

	const staticUrl = new URL(socialImage);
	if (storymap.style) {
		staticUrl.searchParams.set('url', storymap.style as string);
	}

	return {
		title,
		site_description,
		storymap,
		socialImage
	};
};
