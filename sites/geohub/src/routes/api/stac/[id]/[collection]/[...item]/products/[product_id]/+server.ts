import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import {
	createDatasetLinks,
	createMosaicDataSetFeature,
	createTitilerMosaicJsonEndpoint,
	getSTACs
} from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import type { DatasetFeature } from '$lib/types';
import { StacProducts } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params, url }) => {
	const product = params.product_id;
	const type = params.id;

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
		const features: DatasetFeature[] = [];
		const sortedItems = items.sort();
		//
		for (const item of sortedItems) {
			const productFeature = await getProductFeature(stacInstance, product, item, url);
			features.push(productFeature);
		}
		const productAssets: string[] = StacProducts.find(
			(p) => p.collection_id === collection
		).products.find((p) => p.name.toLowerCase() === product).assets;
		let assetUrls = [];
		for (const feature of features) {
			const itemUrl = feature.properties.url;
			const itemJson = await fetch(itemUrl).then((r) => r.json());
			const assets = itemJson.assets;
			for (const asset of productAssets) {
				const url = assets[asset].href;
				if (url) {
					assetUrls = [...assetUrls, url];
				}
			}
		}
		console.log(assetUrls);

		// const urls: string[] = features.map((f) => f.properties.url);
		const name = `${type}/${collection}/${sortedItems.join('/')}/mosaicjson.json`;
		const mosaicjson = await createTitilerMosaicJsonEndpoint(assetUrls, name);
		const mosaicjsonFeature = await createMosaicDataSetFeature(features, mosaicjson);
		mosaicjsonFeature.properties = createDatasetLinks(
			mosaicjsonFeature,
			url.origin,
			env.TITILER_ENDPOINT
		);
		return new Response(JSON.stringify(mosaicjsonFeature));
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
	productFeature.properties = createDatasetLinks(productFeature, url.origin, env.TITILER_ENDPOINT);
	return productFeature;
};
