import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import { createDatasetLinks, getSTACs } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { StacProduct } from '$lib/types';

export const POST: RequestHandler = async ({ params, url, request, locals }) => {
	// const product = params.product_id;

	const type = params.id;
	const requestBody = await request.json();
	const stacProduct: StacProduct = {
		stac_id: params.id,
		collection_id: params.collection,
		product_id: `${requestBody.product_id}`,
		assets: requestBody.assets,
		label: requestBody.label,
		expression: requestBody.expression,
		description: requestBody.description
	};
	const stacs = await getSTACs(locals.pool, 'api');
	const stac = stacs.find((x) => x.id === type);
	if (!stac) {
		error(400, `Only supported the following stac: ${stacs.map((x) => x.id).join(', ')}`);
	}
	const collection = params.collection;
	const items = params.item.split('/');

	const stacInstance = getStacInstance(stac, collection);
	if (items.length === 1) {
		const item = items[0];
		const productFeature = await getProductFeature(stacInstance, stacProduct, item, url);
		return new Response(JSON.stringify(productFeature));
	} else {
		return new Response(JSON.stringify({}));
	}
};

const getProductFeature = async (
	instance: StacTemplate,
	product: StacProduct,
	item: string,
	url: URL
) => {
	const stacItem = await instance.getStacItem(item);
	await instance.getStacCollection();
	const productFeature = await instance.generateDataSetFeature(
		stacItem,
		undefined,
		product.label,
		url.origin
	);

	// add product tags to the productFeature
	productFeature.properties.tags = [
		...productFeature.properties.tags,
		{ key: 'product_expression', value: product.expression },
		{ key: 'product_assets', value: product.assets },
		{ key: 'product_label', value: product.label },
		{ key: 'product_description', value: product.description }
	];

	productFeature.properties = await createDatasetLinks(
		productFeature,
		url.origin,
		env.TITILER_ENDPOINT.replace('cog', 'stac')
	);
	return productFeature;
};
