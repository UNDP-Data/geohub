import type { LayoutServerLoad } from './$types';
import { getSTAC } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { generateHashKey } from '$lib/helper';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const id = params.id;
	const titilerUrl = env.TITILER_ENDPOINT?.replace('/cog', '') ?? '';
	console.log(params);
	const stac = await getSTAC(id);
	console.log(stac.url);
	// const collectionUrl = `${stac.url}/{id}`;
	const datasetId = generateHashKey(stac.url);
	const res = await fetch(`/api/datasets/${datasetId}`);
	const dataset = await res.json();
	const isRegistered = res.status !== 404;
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
