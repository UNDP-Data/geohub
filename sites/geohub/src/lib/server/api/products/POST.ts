import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import type { Product } from '$lib/types';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { ProductManager } from '$lib/server/Product';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<Product>()
	.describe('Return the product object after saving to the databae')
	.openapi({
		example: {
			id: 'ndwi',
			description: 'Normalized Difference Water Index',
			expression: '({asset1}-{asset2})/({asset1}+{asset2})',
			label: 'ndwi'
		}
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

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register a new product';
	c.description = `Register a new product`;
	c.tags = ['products'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	403: apiError(403, 'Permission error')
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}
		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		if (!is_superuser) {
			error(403, { message: 'Permission error' });
		}
		const { id, description, expression, label } = await request.json();

		const pm = new ProductManager(id, description, expression, label);
		const product = await pm.insert();
		return product;
	}
);
