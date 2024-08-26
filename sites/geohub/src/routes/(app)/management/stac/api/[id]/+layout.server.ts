import type { LayoutServerLoad } from './$types';
import { getSTAC } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { generateHashKey } from '$lib/helper';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const id = params.id;

	const titilerUrl = env.TITILER_ENDPOINT?.replace('/cog', '') ?? '';

	const stac = await getSTAC(id);

	const collectionUrl = `${stac.url}collections/sentinel-2-l2a/items`;

	const datasetId = generateHashKey(collectionUrl);

	const datasetRes = await fetch(`/api/datasets/${datasetId}`);

	const dataset = await datasetRes.json();

	const isRegistered = datasetRes.status !== 404;

	if (!stac) {
		error(404, `This stac ID (${id}) is not found.`);
	}

	return {
		stac,
		dataset,
		titilerUrl,
		isRegistered
	};
};
