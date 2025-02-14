import { z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { stacCollectionProductInGeohub } from '$lib/server/schema';
import { error, type RequestEvent } from '@sveltejs/kit';
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
	c.summary = 'delete a STAC collection product';
	c.description = 'delete a STAC collection product';
	c.tags = ['stac', 'products'];
	c = AddSecurictyModifier(c);
	return c;
};

export default async function (
	param: z.infer<typeof Param>,
	{ locals }: RequestEvent
): Promise<Response> {
	/**
	 * delete a product
	 * Needs to be superuser to delete product
	 */
	// delete a product
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

	const res = await db
		.delete(stacCollectionProductInGeohub)
		.where(
			sql`
		${stacCollectionProductInGeohub.stacId}=${param.id} 
		AND ${stacCollectionProductInGeohub.collectionId}=${param.collection} 
		AND ${stacCollectionProductInGeohub.productId}=${param.product_id}
	`
		)
		.returning();
	if (res.length === 0) {
		error(404, {
			message: `${[param.id, param.collection, param.product_id].join(', ')} does not exist in the database`
		});
	}
	return new Response(undefined, {
		status: 204,
		statusText: `Product ${param.id} was deleted successfully`
	});
}
