import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { env } from '$env/dynamic/private';
import { createDatasetLinks, getSTACs } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { getStacInstance } from '$lib/stac/getStacInstance';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import type { DatasetFeature, StacProduct, Tag } from '$lib/types';

export const Output = z
	.custom<DatasetFeature | object>()
	.describe('STAC item dataset feature for GeoHub');

export const Param = z.object({
	id: z.enum(['microsoft-pc', 'earth-search']).describe(`STAC server ID`),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' }),
	item: z
		.string()
		.describe(
			'STAC item ID. To merge items as mosaic, you can put multiple item IDs by separating slash'
		)
		.openapi({ example: 'S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454' })
});

export const Input = z.custom<StacProduct>().openapi({
	example: {
		stac_id: 'string',
		collection_id: 'string',
		product_id: 'string',
		assets: ['string'],
		label: 'string',
		expression: 'string',
		description: 'string'
	}
});

export const Error = {
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get dataset feature of STAC product passed in URL and body for GeoHub';
	c.description = 'get dataset feature of STAC product passed in URL and body for GeoHub';
	c.tags = ['stac', 'products'];
	return c;
};

export default new Endpoint({ Param, Input, Output, Error, Modifier }).handle(
	async (param, { url, request }) => {
		// const product = params.product_id;

		const type = param.id;
		const requestBody = await request.json();
		const stacProduct: StacProduct = {
			stac_id: param.id,
			collection_id: param.collection,
			product_id: `${requestBody.product_id}`,
			assets: requestBody.assets,
			label: requestBody.label,
			expression: requestBody.expression,
			description: requestBody.description
		};
		const stacs = await getSTACs();
		const stac = stacs.find((x) => x.id === type);
		if (!stac) {
			error(
				400,
				`Only supported the following stac: ${stacs
					.filter((s) => s.type === 'api')
					.map((x) => x.id)
					.join(', ')}`
			);
		}
		const collection = param.collection;
		const items = param.item.split('/');

		const stacInstance = getStacInstance(stac, collection);
		if (items.length === 1) {
			const item = items[0];
			const productFeature = await getProductFeature(stacInstance, stacProduct, item, url);
			return productFeature;
		} else {
			return {};
		}
	}
);

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
		...(productFeature.properties.tags as Tag[]),
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
