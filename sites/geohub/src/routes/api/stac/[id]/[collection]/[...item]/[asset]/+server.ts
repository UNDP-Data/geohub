import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import {
	createDatasetLinks,
	createMosaicDataSetFeature,
	createTitilerMosaicJsonEndpoint,
	getSTACs
} from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { getStacInstance } from '$lib/stac/getStacInstance';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import type { DatasetFeature } from '$lib/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;

	const stacs = await getSTACs('api');
	const stac = stacs.find((x) => x.id === id);
	if (!stac) {
		throw error(400, `Only supported the following stac: ${stacs.map((x) => x.id).join(', ')}`);
	}
	const collection = params.collection;
	const asset = params.asset;

	const stacInstance = getStacInstance(stac, collection);

	const items = params.item.split('/');
	if (items.length === 1) {
		// COG
		const item = items[0];
		const feature = await getDatasetFeature(stacInstance, item, asset, url);
		return new Response(JSON.stringify(feature));
	} else {
		// mosaicjson
		const features: DatasetFeature[] = [];

		const sortedItems = items.sort();

		for (const item of sortedItems) {
			const feature = await getDatasetFeature(stacInstance, item, asset, url);
			features.push(feature);
		}
		const urls: string[] = features.map((f) => f.properties.url);
		const name = `${id}/${collection}/${sortedItems.join('/')}/mosaicjson.json`;
		const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
		const mosaicjsonFeature = await createMosaicDataSetFeature(features, mosaicjson);
		mosaicjsonFeature.properties = createDatasetLinks(
			mosaicjsonFeature,
			url.origin,
			env.DEV_TITILER_ENDPOINT
		);
		return new Response(JSON.stringify(mosaicjsonFeature));
	}
};

const getDatasetFeature = async (instance: StacTemplate, item: string, asset: string, url: URL) => {
	const stacItem = await instance.getStacItem(item);
	await instance.getStacCollection();

	const feature = await instance.generateDataSetFeature(stacItem, asset);
	feature.properties = createDatasetLinks(feature, url.origin, env.DEV_TITILER_ENDPOINT);

	const selfLink = feature.properties.links.find((l) => l.rel === 'self');
	selfLink.href = url.href;

	return feature;
};
