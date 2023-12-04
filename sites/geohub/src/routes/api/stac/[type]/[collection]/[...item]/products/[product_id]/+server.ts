import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import { createDatasetLinks } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params, url }) => {
	const product_id = params.product_id;
	const stacInstance = getStacInstance(params.type, params.collection);
	const items: string[] = params.item.split('/');
	if (items.length === 1) {
		const item = items[0];
		const product = await getProductFeature(stacInstance, product_id, item, url);
		return new Response(JSON.stringify(product));
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
	// console.log(await instance.getStacCollection())
	const productFeature = await instance.generateProductFeature(stacItem, product);
	// console.log(stacItem)
	productFeature.properties = createDatasetLinks(
		productFeature,
		url.origin,
		'https://titiler.xyz/stac'
	);
	return productFeature;
};
