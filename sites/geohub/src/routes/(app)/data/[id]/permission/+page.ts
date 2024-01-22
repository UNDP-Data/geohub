import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { feature } = data;
	const title = `Permission | ${feature.properties.name} | Data | GeoHub`;
	const content = `User permission for ${feature.properties.name}`;
	const site_description = feature.properties.description;

	return {
		title,
		content,
		site_description,
		feature
	};
};
