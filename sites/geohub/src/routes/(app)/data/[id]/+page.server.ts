import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const { socialImage } = await parent();
	const id = params.id;

	const res = await fetch(`/api/datasets/${id}`);
	if (!res.ok) {
		if (res.status === 403) {
			error(res.status, { message: 'No permission to access' });
		} else if (res.status === 404) {
			error(res.status, { message: 'No dataset found' });
		} else {
			error(res.status, { message: res.statusText });
		}
	}
	const feature: DatasetFeature = await res.json();

	const styleUrl = feature.properties.links?.find((l) => l.rel === 'stylejson')?.href;
	const staticUrl = new URL(socialImage);
	if (styleUrl) {
		staticUrl.searchParams.set('url', styleUrl);
	}

	const title = `${feature.properties.name} | Data | GeoHub`;
	const content = feature.properties.name;
	const site_description = feature.properties.description;

	return {
		title,
		content,
		site_description,
		socialImage: staticUrl.href,
		feature
	};
};
