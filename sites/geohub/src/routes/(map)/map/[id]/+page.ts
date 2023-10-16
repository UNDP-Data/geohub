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

export const csr = true;
export const ssr = false;
