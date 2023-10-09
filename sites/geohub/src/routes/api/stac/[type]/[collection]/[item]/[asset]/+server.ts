import { StacApis } from '$lib/config/AppConfig';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createDatasetLinks } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { getStacInstance } from '$lib/stac/getStacInstance';

export const GET: RequestHandler = async ({ params, url }) => {
	const type = params.type;
	const stacApi = StacApis.find((x) => x.id === type);
	if (!stacApi) {
		throw error(400, `Only supported the following stac: ${StacApis.map((x) => x.id).join(', ')}`);
	}
	const collection = params.collection;
	const itemId = params.item;
	const asset = params.asset;

	const stacInstance = getStacInstance(type, collection);

	const stacItem = await stacInstance.getStacItem(itemId);
	await stacInstance.getStacCollection();

	const feature = await stacInstance.generateDataSetFeature(stacItem, asset);
	feature.properties = createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
	return new Response(JSON.stringify(feature));
};
