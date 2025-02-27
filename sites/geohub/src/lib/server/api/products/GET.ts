import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { productInGeohub } from '$lib/server/schema';
import type { Product } from '$lib/types';

export const Output = z
	.custom<Product[]>()
	.describe('Return the list of avaiable products')
	.openapi({
		example: [
			{
				id: 'ndwi',
				description: 'Normalized Difference Water Index',
				expression: '({asset1}-{asset2})/({asset1}+{asset2})',
				label: 'ndwi'
			}
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a list of all available products';
	c.description = `Get a list of products available for a collection`;
	c.tags = ['products'];
	return c;
};

export default new Endpoint({ Output, Modifier }).handle(async () => {
	const products = await db
		.select({
			id: productInGeohub.id,
			description: productInGeohub.description,
			expression: productInGeohub.expression,
			label: productInGeohub.label
		})
		.from(productInGeohub);

	return products;
});
