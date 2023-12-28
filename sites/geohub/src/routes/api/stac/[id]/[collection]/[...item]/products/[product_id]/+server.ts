import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import { createDatasetLinks, getSTACs } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
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
		return new Response(JSON.stringify({}));
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
		env.TITILER_ENDPOINT.replace('cog', 'stac')
	);
	return productFeature;
};
