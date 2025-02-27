import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import type { Product } from '$lib/types';
import { ProductManager } from '$lib/server/Product';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<Product>()
	.describe('Return the updated product')
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

export const Input = z
	.custom<Product>()
	.describe('Product object for saving')
	.openapi({
		example: {
			id: 'ndwi',
			description: 'Normalized Difference Water Index',
			expression: '({asset1}-{asset2})/({asset1}+{asset2})',
			label: 'ndwi'
		}
	});

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, `does not exist in the database`)
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Update a product';
	c.description = `Update a product by product ID`;
	c.tags = ['products'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Input, Param, Output, Error, Modifier }).handle(
	async (param, { request, locals }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}
		let is_superuser = false;
		const user_email = session?.user.email;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		if (!is_superuser) {
			error(403, { message: 'Permission error' });
		}
		const { description, expression, label } = await request.json();
		const id = param.id as string;

		const pm = new ProductManager(id, description, expression, label);
		let product = await pm.get();
		if (!product) {
			error(404, { message: `does not exist in the database` });
		}
		product = await pm.update();
		return product;
	}
);
