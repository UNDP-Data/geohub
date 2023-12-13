import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import { createDatasetLinks, getSTACs } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
// import type { DatasetFeature } from '$lib/types';
// import { AccessLevel, attribution, StacProducts } from '$lib/config/AppConfig';
// import { env } from '$env/dynamic/private';
// import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
// import { generateHashKey } from '$lib/helper';

export const GET: RequestHandler = async ({ params, url }) => {
	const product = params.product_id;
	const type = params.type;

	const stacs = await getSTACs('api');
	const stac = stacs.find((x) => x.id === type);
	if (!stac) {
		throw error(400, `Only supported the following stac: ${stacs.map((x) => x.id).join(', ')}`);
	}
	const collection = params.collection;
	const items = params.item.split('/');
	const stacInstance = getStacInstance(stac, collection);
	if (items.length === 1) {
		const item = items[0];
		const productFeature = await getProductFeature(stacInstance, product, item, url);
		return new Response(JSON.stringify(productFeature));
	} else {
		// const features: DatasetFeature[] = [];
		// const sortedItems = items.sort();
		//
		// for (const item of sortedItems) {
		// 	const productFeature = await getProductFeature(stacInstance, product_id, item, url);
		// 	features.push(productFeature);
		// }
		// const items = StacProducts.find((p) => p.id === product_id)?.items;
		// const urls: string[] = features.map((f) => f.properties.url);
		// const name = `${type}/${collection}/${sortedItems.join('/')}/mosaicjson.json`;
		// const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
		// const mosaicjsonFeature = await createMosaicProductFeature(features, mosaicjson);
		// mosaicjsonFeature.properties = createDatasetLinks(
		// 	mosaicjsonFeature,
		// 	url.origin,
		// 	'https://titiler.xyz/stac'
		// );
		// return new Response(JSON.stringify(mosaicjsonFeature));
	}
};

const getProductFeature = async (
	instance: StacTemplate,
	product: string,
	item: string,
	url: URL
) => {
	const stacItem = await instance.getStacItem(item);
	await instance.getStacCollection();
	const productFeature = await instance.generateDataSetFeature(stacItem, undefined, product);
	productFeature.properties = createDatasetLinks(
		productFeature,
		url.origin,
		'https://titiler.xyz/stac'
	);
	return productFeature;
};
