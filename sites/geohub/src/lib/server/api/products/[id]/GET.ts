import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import type { Product } from '$lib/types';
import { ProductManager } from '$lib/server/Product';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<Product>()
	.describe('Return the product')
	.openapi({
		example: {
			id: 'ndwi',
			description: 'Normalized Difference Water Index',
			expression: '({asset1}-{asset2})/({asset1}+{asset2})',
			label: 'ndwi'
		}
	});

export const Param = z.object({
	id: z.string().describe('Product ID').openapi({ example: 'ndwi' })
});

export const Error = {
	404: apiError(404, `does not exist in the database`)
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a specific product';
	c.description = `Get a specific product by product ID`;
	c.tags = ['products'];
	return c;
};

export default new Endpoint({ Param, Output, Error, Modifier }).handle(async (param) => {
	const id = param.id;

	const pm = new ProductManager(id as string);
	const product = await pm.get();
	if (!product) {
		error(404, { message: `does not exist in the database` });
	}
	return product;
});
