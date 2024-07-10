import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { style, socialImage } = data;
	const title = `${style.name} | Maps | GeoHub`;
	const content = style.name;

	return {
		title,
		content,
		style,
		socialImage
	};
};
