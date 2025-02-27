import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import { productInGeohub, stacCollectionProductInGeohub } from '$lib/server/schema';
import { error } from '@sveltejs/kit';
import type { StacProduct } from '$lib/types/StacProduct';

export const Output = z.custom<StacProduct>().openapi({
	example: {
		stac_id: 'earth-search',
		collection_id: 'sentinel-2-l2a',
		product_id: 'ndvi',
		assets: ['nir', 'red'],
		label: 'ndvi',
		expression: '(nir-red)/(nir+red)',
		description: 'Normalized Difference Vegetation Index'
	}
});

export const Param = z.object({
	id: z.string().describe(`STAC server ID`).openapi({ example: 'earth-search' }),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' }),
	product_id: z.string().describe('Product ID').openapi({ example: 'ndvi' })
});

export const Error = {
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get a STAC collection product';
	c.description = 'get a STAC collection product';
	c.tags = ['stac', 'products'];
	return c;
};

export default new Endpoint({ Param, Output, Error, Modifier }).handle(async (param) => {
	const productDetails = await db
		.select({
			stac_id: stacCollectionProductInGeohub.stacId,
			collection_id: stacCollectionProductInGeohub.collectionId,
			product_id: stacCollectionProductInGeohub.productId,
			assets: stacCollectionProductInGeohub.assets,
			label: productInGeohub.label,
			expression: productInGeohub.expression,
			description: productInGeohub.description
		})
		.from(stacCollectionProductInGeohub)
		.innerJoin(productInGeohub, eq(stacCollectionProductInGeohub.productId, productInGeohub.id))
		.where(sql`
			${stacCollectionProductInGeohub.stacId}=${param.id} 
			AND ${stacCollectionProductInGeohub.collectionId}=${param.collection} 
			AND ${stacCollectionProductInGeohub.productId}=${param.product_id}
		`);

	if (productDetails.length === 0) {
		error(404, { message: 'Not found' });
	}

	const detail = productDetails[0];

	const expression = detail.expression;
	const assets = detail.assets;
	const asset_index_mapping = assets.map((asset: string, index: number) => {
		return {
			[`asset${index + 1}`]: asset
		};
	});

	detail.expression = replaceTextWithMapping(expression, asset_index_mapping);

	return detail as StacProduct;
});

// Function to replace text based on mapping
const replaceTextWithMapping = (
	text: string,
	mapping: {
		[x: string]: string;
	}[]
) => {
	for (let i = 0; i < mapping.length; i++) {
		const key = Object.keys(mapping[i])[0];
		const value = mapping[i][key];
		const regex = new RegExp('\\{' + key + '\\}', 'g');
		text = text.replace(regex, value);
	}
	return text;
};
