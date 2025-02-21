import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { stacCollectionProductInGeohub } from '$lib/server/schema';
import { error } from '@sveltejs/kit';
import type { StacProduct } from '$lib/types/StacProduct';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';

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

export const Input = z.custom<StacProduct>();

export const Param = z.object({
	id: z.string().describe(`STAC server ID`).openapi({ example: 'earth-search' }),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' }),
	product_id: z.string().describe('Product ID').openapi({ example: 'ndvi' })
});

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Create new STAC collection product';
	c.description = 'Create new STAC collection product';
	c.tags = ['stac', 'products'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Param, Input, Output, Error, Modifier }).handle(
	async (param, { locals, request }) => {
		/**
		 * register a new product for the available stac collection
		 * Needs to be superuser to register product
		 */
		// register a new product to available stac collection
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
		const requestBody = await request.json();
		const assets = requestBody.assets;
		const description = requestBody.description;
		const stac_id = param.id as string;
		const collection_id = param.collection as string;
		const product_id = param.product_id as string;

		const result = await db
			.insert(stacCollectionProductInGeohub)
			.values({
				stacId: stac_id,
				collectionId: collection_id,
				productId: product_id,
				assets: assets,
				description: description
			})
			.onConflictDoNothing()
			.returning();

		return result as unknown as StacProduct;
	}
);
