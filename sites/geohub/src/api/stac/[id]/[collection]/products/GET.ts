import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { stacCollectionProductInGeohub } from '$lib/server/schema';

export const Output = z
	.array(
		z.object({
			stac_id: z.string(),
			collection_id: z.string(),
			product_id: z.string(),
			assets: z.array(z.string()),
			description: z.custom<string | null>()
		})
	)
	.openapi({
		example: [
			{
				stac_id: 'earth-search',
				collection_id: 'sentinel-2-l2a',
				product_id: 'ndvi',
				assets: ['nir', 'red'],
				description: 'Normalized Difference Vegetation Index'
			},
			{
				stac_id: 'earth-search',
				collection_id: 'sentinel-2-l2a',
				product_id: 'ndwi',
				assets: ['green', 'nir'],
				description: 'Normalized Difference Water Index'
			}
		]
	});

export const Param = z.object({
	id: z.enum(['microsoft-pc', 'earth-search']).describe(`STAC server ID`),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' })
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get the list of products registered to a specific stac dataset';
	c.description = 'get the list of products registered to a specific stac dataset';
	c.tags = ['stac', 'products'];
	return c;
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param) => {
	const products = await db
		.select({
			stac_id: stacCollectionProductInGeohub.stacId,
			collection_id: stacCollectionProductInGeohub.collectionId,
			product_id: stacCollectionProductInGeohub.productId,
			assets: stacCollectionProductInGeohub.assets,
			description: stacCollectionProductInGeohub.description
		})
		.from(stacCollectionProductInGeohub).where(sql`
			${stacCollectionProductInGeohub.stacId} = ${param.id} 
			AND
			${stacCollectionProductInGeohub.collectionId} = ${param.collection}
		`);
	return products;
});
