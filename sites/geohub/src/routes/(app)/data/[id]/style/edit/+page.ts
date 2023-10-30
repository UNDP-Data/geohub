import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { feature } = data;
	const title = `Style edit | ${feature.properties.name} | Data | GeoHub`;
	const content = feature.properties.name;
	const site_description = feature.properties.description;

	return {
		title,
		content,
		site_description,
		feature
	};
};
