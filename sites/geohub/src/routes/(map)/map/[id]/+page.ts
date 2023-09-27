import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { style } = data;
	const title = `${style.name} | Map | GeoHub`;
	const content = style.name;

	return {
		title,
		content,
		style
	};
};
